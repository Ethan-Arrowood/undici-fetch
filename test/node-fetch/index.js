'use strict'

const { Octokit } = require('octokit')
const fs = require('fs')
const path = require('path')
const assert = require('assert/strict')

const paths = {
  base: path.join(__dirname, 'files'),
  cache: path.join(__dirname, '.cache')
}

const wantedContent = new Set([ 'test', 'package.json' ])

function intializeOctokit () {
  const warningMessage = 'Warning: gh_pat not found in .env file. You may encounter an API rate limit error for the GitHub API. To fix this, generate a PAT token (https://github.com/settings/tokens), create a .env file in the root of the undici-fetch directory, and assign the token to `gh_pat`.\nFor example: echo \'gh_pat=<paste_PAT_token_here>\' >> .env'

  let ghPAT = null

  try {
    const data = fs.readFileSync('.env', { encoding: 'utf-8' })
    if (data.length === 0 || !data.includes('gh_pat')) {
      console.warn(warningMessage)
    } else {
      ghPAT = data.split('=')[1]
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(warningMessage)
    } else {
      throw error
    }
  }

  return new Octokit({ userAgent: 'undici-fetch', auth: ghPAT })
}

const octokit = intializeOctokit()

/**
 * Checks for the existance of local **test** directory and **.cache** file. Re-throws errors that are not `error.code === ENOENT`
 * @returns {boolean} true if both items exist
 */
function cacheFileAndBaseDirExist () {
  try {
    const baseStat = fs.statSync(paths.base)
    const baseDirFiles = fs.readdirSync(paths.base)
    const cacheStat = fs.statSync(paths.cache)
    return baseStat.isDirectory() && baseDirFiles.length > 0 && cacheStat.isFile()
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

/**
 * Verifies if the content is currently cached or not. Re-throws non-AssertionErrors.
 * @param {Array} content 
 * @returns {boolean} true if deep strict equal to cached content
 */
function verifyCache (content) {
  if (cacheFileAndBaseDirExist()) {
    const cache = JSON.parse(fs.readFileSync(paths.cache, { encoding: 'utf-8' }))

    try {
      assert.deepStrictEqual(content, cache)
      return true
    } catch (error) {
      if (error instanceof assert.AssertionError) {
        return false
      } else {
        throw error
      }
    }
  } else {
    return false
  }
}

async function downloadTree (treePath, treeSha) {
  const { data } = await octokit.rest.git.getTree({
    owner: 'node-fetch',
    repo: 'node-fetch',
    tree_sha: treeSha,
    recursive: true
  })

  fs.rmSync(treePath, { recursive: true, force: true })
  fs.mkdirSync(treePath)

  const createDirectories = data.tree.reduce((accumulator, entry) => {
    if (entry.type === 'tree') {
      accumulator.push(fs.promises.mkdir(path.join(treePath, entry.path)))
    }

    return accumulator
  }, [])

  await Promise.all(createDirectories)

  const createBlobs = data.tree.reduce((accumulator, entry) => {
    if (entry.type === 'blob') {
      accumulator.push(downloadFile(path.join(treePath, entry.path), entry.sha))
    } 

    return accumulator
  }, [])

  await Promise.all(createBlobs)
}

async function downloadFile (filePath, fileSha) {
  const { data: blob } = await octokit.rest.git.getBlob({
    owner: 'node-fetch',
    repo: 'node-fetch',
    file_sha: fileSha
  })

  return fs.promises.writeFile(filePath, blob.content, {
    encoding: blob.encoding
  })
}

/**
 * 
 * @param {Array} content 
 */
async function downloadContent(content) {
  const downloads = content.reduce((accumulator, entry) => {
    if (entry.type === 'dir') {
      accumulator.push(downloadTree(path.join(paths.base, entry.path), entry.sha))
    } else if (entry.type === 'file') {
      accumulator.push(downloadFile(path.join(paths.base, entry.path), entry.sha))
    } else {
      throw new Error(`Unrecognized entry type ${entry.type}`)
    }

    return accumulator
  }, [])
  await Promise.all(downloads)
}

async function getNodeFetchTestFiles () {
  const { data: repoContent } = await octokit.rest.repos.getContent({
    owner: 'node-fetch',
    repo: 'node-fetch'
  })

  const content = repoContent.filter(({ name }) => wantedContent.has(name))

  if (!verifyCache(content)) {
    fs.mkdirSync(paths.base)
    fs.writeFileSync(paths.cache, JSON.stringify(content), { encoding: 'utf-8' })

    await downloadContent(content)
  }
}

async function patchPackageJSON (sha) {
  const { data: { content, encoding } } = await octokit.rest.git.getBlob({
    owner: 'node-fetch',
    repo: 'node-fetch',
    file_sha: sha
  })
}

getNodeFetchTestFiles()

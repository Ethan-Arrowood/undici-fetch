'use strict'

const { Octokit } = require('octokit')
const { promises: fs } = require('fs')
const { join } = require('path')

async function intializeOctokit () {
  const warningMessage = 'Warning: gh_pat not found in .env file. You may encounter an API rate limit error for the GitHub API. To fix this, generate a PAT token (https://github.com/settings/tokens), create a .env file in the root of the undici-fetch directory, and assign the token to `gh_pat`.\nFor example: echo \'gh_pat=<paste_PAT_token_here>\' >> .env'

  let ghPAT = null

  try {
    const data = await fs.readFile('.env', { encoding: 'utf-8' })
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

async function fileOrDirectoryExists (path) {
  try {
    const stat = await fs.stat(path)
    return stat.isDirectory() || stat.isFile()
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

async function getNodeFetchTests () {
  const octokit = await intializeOctokit()

  const { data: content } = await octokit.rest.repos.getContent({
    owner: 'node-fetch',
    repo: 'node-fetch'
  })

  let { sha } = content.find(item => item.name === 'test')
  let downloadNodeFetchTests = true
  if (await fileOrDirectoryExists(join(__dirname, 'test')) &&
      await fileOrDirectoryExists(join(__dirname, '.cache'))) {
    const cached = await fs.readFile(join(__dirname, '.cache'), { encoding: 'utf-8' })
    if (cached.length > 0) {
      const cachedSha = cached.split('=')[1]
      if (cachedSha === sha) {
        downloadNodeFetchTests = false
      } else {
        sha = cachedSha
      }
    }
  }
  await fs.writeFile(join(__dirname, '.cache'), `node-fetch-sha=${sha}`, { encoding: 'utf-8' })

  if (downloadNodeFetchTests) {
    const { data } = await octokit.rest.git.getTree({
      owner: 'node-fetch',
      repo: 'node-fetch',
      tree_sha: sha,
      recursive: true
    })
    await fs.rm(join(__dirname, 'test'), { recursive: true, force: true })
    await fs.mkdir(join(__dirname, 'test'), {})
    for (const entry of data.tree) {
      if (entry.type === 'blob') {
        const { data: { content, encoding } } = await octokit.rest.git.getBlob({
          owner: 'node-fetch',
          repo: 'node-fetch',
          file_sha: entry.sha
        })
        await fs.writeFile(join(__dirname, 'test', entry.path), Buffer.from(content, encoding).toString('utf-8'))
      } else if (entry.type === 'tree') {
        await fs.mkdir(join(__dirname, 'test', entry.path))
      } else {
        throw new Error(`Unrecognized file type ${entry.type}`)
      }
    }
  }
}

getNodeFetchTests()

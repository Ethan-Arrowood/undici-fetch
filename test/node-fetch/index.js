'use strict'

const { Octokit } = require('octokit')
const { promises: fs } = require('fs')
const { join } = require('path')
const octokit = new Octokit({ userAgent: 'undici-fetch' })

async function getNodeFetchTests () {
  const { data: content } = await octokit.rest.repos.getContent({
    owner: 'node-fetch',
    repo: 'node-fetch'
  })

  let { sha } = content.find(item => item.name === 'test')
  let downloadNodeFetchTests = true
  if ((await fs.stat(join(__dirname, 'test'))).isDirectory() &&
      (await fs.stat(join(__dirname, '.cache'))).isFile()) {
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
        console.log(data)
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

#!/usr/bin/env node

/**
 * This program applies some patches to the sources in order to get rid of
 * Firebase dependency on the Android version:
 *
 *   - remove dependency to @capacitor/push-notifications
 *   - remove dependency to firebase-messaging and gms in build.gradle
 *   - add ".free" suffix to applicationId in build.gradle
 *   - replace push.ts with a stub implementation (push.stub.ts)
 *
 * As a result, push notifications will be unavailable on the app.
 *
 * To prevent any loss, this script will refuse to run if the current source
 * tree has uncommitted changes. You can still force it to run by setting the
 * PATCH_NONFREE_FORCE environment variable to "1" or "true".
 */

const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')

const rootDir = path.join(__dirname, '..')

function isRepoDirty() {
  try {
    childProcess.execSync('git diff-index --quiet HEAD')
  } catch (error) {
    if (error.status === 1) {
      return true
    }
    throw error
  }
  return false
}

function rewriteFile(filePath, func) {
  const newContent = func(fs.readFileSync(filePath, 'utf-8'))
  fs.writeFileSync(filePath, newContent, 'utf-8')
}

function patchPackageJson() {
  console.log('Patching package.json.')
  rewriteFile(
    path.join(rootDir, 'package.json'),
    (content) => {
      content = content.replaceAll(/^.*"@capacitor\/push-notifications".*$[\r\n]/mg, '')
      return content
    }
  )
}

function removeNonFreeSections(s) {
  return s.replaceAll(/^.*BEGIN NONFREE[\s\S]*?END NONFREE.*$[\r\n]/mg, '')
}

function patchBuildGradle() {
  console.log('Patching build.gradle.')
  rewriteFile(
    path.join(rootDir, 'android', 'build.gradle'),
    (content) => {
      content = removeNonFreeSections(content)
      return content
    }
  )
}


function patchAppBuildGradle() {
  console.log('Patching app/build.gradle.')
  rewriteFile(
    path.join(rootDir, 'android', 'app', 'build.gradle'),
    (content) => {
      content = removeNonFreeSections(content)
      content = content.replaceAll(
        'applicationId "org.lichess.mobileapp"',
        'applicationId "org.lichess.mobileapp.free"',
      )
      return content
    }
  )
}

function useStubPush() {
  console.log('Replacing push implementation with stub.')

  const srcDir = path.join(rootDir, 'src')
  const source = path.join(srcDir, 'push.stub.ts')
  const target = path.join(srcDir, 'push.ts')
  fs.copyFileSync(source, target)
}

if (!['true', '1'].includes(process.env['PATCH_NONFREE_FORCE']) && isRepoDirty()) {
  console.error('Local repository has uncommitted changes. Aborting.')
  process.exit(1)
}

patchPackageJson()
patchBuildGradle()
patchAppBuildGradle()
useStubPush()

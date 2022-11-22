// https://stackoverflow.com/questions/67150826/ask-users-to-input-value-for-npm-script
// https://www.npmjs.com/package/prompts
// https://www.npmjs.com/package/execa

import { execSync } from 'child_process'
import readline from 'readline'

function exec(commands) {
  execSync(commands, { stdio: 'inherit', shell: true })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Input version tag: ', (version) => {
  console.log(`Deploy dist branch to Github with version ${version}`)
  exec('rm -rf ./dist/.git')
  exec(`sh deploy.sh ${version}`)
  rl.close()
})

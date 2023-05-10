// https://stackoverflow.com/questions/67150826/ask-users-to-input-value-for-npm-script
// https://www.npmjs.com/package/prompts
// https://www.npmjs.com/package/execa

import { execSync } from 'node:child_process'
import readline from 'node:readline'

function exec(commands) {
  execSync(commands, { stdio: 'inherit', shell: true })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask() {
  rl.question('Where to push (target branch name)? ', (branchName) => {
    if (!branchName) {
      console.log('Please input target branch name.')
      ask()
      return
    }
  
    console.log(`Push dist folder to branch ${branchName}.\n`)
    exec(`sh deploy.sh ${branchName}`)
    rl.close()
  })
}

ask()

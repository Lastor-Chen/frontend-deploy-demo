
import inquirer from 'inquirer'
import { $ } from 'execa'

const $$ = $({ stdio: 'inherit', shell: true })

const answer = await inquirer.prompt([
  {
    type: 'list',
    name: 'branch',
    message: 'Where to push (target branch name)?',
    choices: ['preview', 'dist']
  }
])

$$`sh deploy.sh ${answer.branch}`

import chalk from 'chalk'

const formatOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}

const formatter = new Intl.DateTimeFormat('en-US', formatOptions)

const time = () => chalk.gray(formatter.format(new Date()))

const _log = (prefix: string, message: any[]) =>
  console.log(time(), prefix, ...message)

export const log = (...message: any[]) => _log('', message)

export const warn = (...message: any[]) => _log(chalk.yellow('WARN:'), message)

export const error = (...message: any[]) => _log(chalk.red('ERROR:'), message)

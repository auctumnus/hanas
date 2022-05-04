import { HanasClient } from './index'

const c = new HanasClient({
  hanasURL: 'http://localhost:1337',
  kratosURL: 'http://localhost:4433',
})
c.login('wnerwmwerjl', 'this_is_an_example')

console.log(c.options.token)

c.users
  .all()
  .then((res) => res.next())
  .then((res) => {
    console.log(res)
  })

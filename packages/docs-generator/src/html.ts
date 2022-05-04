import { Model, Property, StringProperty } from './types'
import { HTTPVerb, Route, Operation, Request } from './route'
import { Meta } from './meta'
import { md } from './markdown'
import GithubSlugger from 'github-slugger'
import { STATUS_CODES } from 'http'

const slug = GithubSlugger.slug

type ObjOf<T> = Record<string, T>

const template = (o: {
  routeContent: string
  routeOutline: string
  modelContent: string
  modelOutline: string
  meta: Meta
}) =>
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">

    <!-- google fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>


    <title>${o.meta.name}</title>
    <meta name="title" content="${o.meta.name}">
    <meta name="description" content="${o.meta.summary}">

    <meta name="viewport" content="width=device-width,initial-scale=1">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="style.css">
    <script>
      var recentlyCopied = []

      setInterval(function () {
        recentlyCopied.pop()
      }, 5000)

      function copyLink(element) {
        if('clipboard' in navigator) {
          navigator.clipboard.writeText(element.baseURI)

          var copied = document.createElement('span')
          copied.classList.add('copied-popup')
          copied.classList.add('fadeable')

          if(recentlyCopied.indexOf(element) > -1) {
            copied.innerText = "stop copying me >:^("
            recentlyCopied[recentlyCopied.indexOf(element)] = undefined
          } else {
            copied.innerText = "link copied!"
          }
          recentlyCopied.push(element)

          copied.setAttribute("role", "alert")

          if(element.nextSibling) {
            if(!element.nextSibling.classList || !element.nextSibling.classList.contains('copied-popup'))
              element.parentNode.insertBefore(copied, element.nextSibling)
          } else {
            element.parentNode.appendChild(copied)
          }

          setTimeout(function() {
            copied.classList.add('fade-out')
            setTimeout(function() {
              copied.remove()
            }, 1000)
          }, 500)
        }
      }
    </script>
  </head>
  <body>
    <header id="top-bar">
      <nav id="menu">
        <!-- major apologies on the header nesting lmfoa -->
        <header>
          <label>
            <input type="checkbox">
            <svg id="open-button" alt="Open menu" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            <svg id="close-button" alt="Close menu" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </label>
          <h1>Navigation</h1>
        </header>
        <ul>
          <li><h2><a href="#header">Summary</a></h2></li>
          <li>
            <h2><a href="#models">Models</a></h2>
            ${o.modelOutline}
          </li>

          <li>
            <h2><a href="#routes">Routes</a></h2>
            ${o.routeOutline}
          </li>
        </ul>
      </nav>
      <h1>${o.meta.name}</h1>
    </header>
    <main>
      <header id="header">
        <h1>${o.meta.name}</h1>
        ${md.render(o.meta.summary)}
        ${md.render(o.meta.description)}
        <noscript>
          <p>
            Note that while these docs work without Javascript, some enhancements
            may be unavailable. The menu also requires Javascript when the
            viewport is at a mobile size.
          </p>
        </noscript>
      </header>
      <section id="models">
        <h2>Models</h2>
        ${o.modelContent}
      </section>
      <section id="routes">
        <h2>Routes</h2>
        ${o.routeContent}
      </section>
    </main>
    <script>
      var nav = document.querySelector('nav#menu')
      var input = document.querySelector('nav#menu input')
      input.addEventListener('click', function() {
        nav.classList.toggle('active')
      })
    </script>
  </body>
</html>
`

const routeSlug = (route: Route) =>
  route.path === '/'
    ? 'base'
    : `route-${slug(route.path.replaceAll('/', ' ').trim())}`
const modelSlug = (name: string) => `model-${slug(name)}`

const operationSlug = (route: Route, verb: string) =>
  route.path === '/'
    ? `base-${verb}`
    : `route-${slug(route.path.replaceAll('/', ' ').trim() + ` ${verb}`)}`

const highlightRoutePath = (path: string) =>
  path
    .split('/')
    .map((s) => (s.startsWith(':') ? `<span class="param">${s}</span>` : s))
    .join('<wbr>/')
    .replace('<wbr>', '')

const routesOutline = (routes: Route[]): string =>
  `
<ul>
  <li>
  ${routes
    .map((route) =>
      route.subroutes.length
        ? `
        <details open>
          <summary><a href="#${routeSlug(
            route
          )}" class="route"><code>${highlightRoutePath(
            route.path
          )}</code></a></summary>
          ${routesOutline(route.subroutes)}
        </details>
      `
        : `<a href="#${routeSlug(
            route
          )}" class="route final"><code>${highlightRoutePath(
            route.path
          )}</code></a>`
    )
    .join('</li><li>')}
  </li>
</ul>
`

const httpVerbChip = (route: Route) => (v: string) =>
  `<a href="#${operationSlug(route, v)}" class="verb-chip ${v}">${v}</a>`

const link = (slug: string) =>
  `<a onclick="copyLink(this)" class="anchor" href="#${slug}"><svg title="Copy link" alt="Copy link" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
</svg></a>`

const length = (max: number | undefined, min: number | undefined) => {
  if (max !== undefined && min !== undefined) {
    return `between ${min} and ${max} characters`
  } else if (max === undefined && min !== undefined) {
    return `at least ${min} characters`
  } else if (min === undefined && max !== undefined) {
    return `up to ${max} characters`
  } else {
    return ''
  }
}

const stringSpecifics = (p: Property) => {
  if (p.type !== 'string') return ''
  p = p as StringProperty
  return p.format || p.regex || p.maxLength || p.minLength
    ? ` (${[
        p.format,
        p.regex ? `<code>/${p.regex}/</code>` : '',
        length(p.maxLength, p.minLength),
      ]
        .filter((v) => v)
        .join(', ')})`
    : ''
}

const propertyHtml = (p: Property) =>
  `
  <div class="property">
    <div class="property-header">
      <code>${p.name}</code>
      <span class="property-type">
        <span class="property-type-name type-${p.type}">${p.type}</span>
        <span class="property-type-specifics">${stringSpecifics(p)}</span>
      </span>
    </div>
    <div class="property-description">
      ${p.description ? `<p>${md.render(p.description)}</p>` : ''}
    </div>
  </div>
  `

const modelBodyHtml = (model: Model) =>
  Object.values(model.properties).map(propertyHtml).join('')

const propertyExample = (property: Property) => {
  if ('includes' in property) {
    return '<span class="type-note">(broken include)</span>'
  } else if ('properties' in property) {
    return '<span class="type-note">(TODO: implement model properties)</span class="type-note">'
  } else if ('type' in property) {
    if (property.type === 'string') {
      if (!property.example && property.format) {
        if (property.format === 'datetime') {
          // random time on 09-27-2021
          // bonus points if you know why i picked that day :-)
          const min = +new Date('2021-09-27')
          const max = +new Date('2021-09-28')
          const date = new Date(Math.random() * (max - min) + min).toISOString()
          return `<span class="string">"${date}"</span>`
        } else if (property.format === 'uri') {
          return `<span class="string">https://example.com/resource</span>`
        }
      }
      return property.example
        ? `<span class="string">"${property.example}"</span>`
        : '<span class="string">""</span>'
    } else if (property.type === 'number') {
      return property.example
        ? `<span class="number">${property.example}</span>`
        : '<span class="number">0</span>'
    } else if (property.type === 'boolean') {
      return property.example
        ? `<span class="boolean">${property.example}</span>`
        : '<span class="boolean">false</span>'
    }
  } else {
    return '<span class="type-note">(unknown type)</span>'
  }
}

const modelExample = (model: Model) =>
  `
<pre class="example"><code><span class="example-text">Example</span>
{
    ${Object.entries(model.properties)
      .map(([name, property]) => `${name}: ${propertyExample(property)}`)
      .join(',\n    ')}
}</code></pre>
`

const modelToHtml = (model: Model) =>
  `
  <section id=${modelSlug(model.name)} class="model">
    <details>
      <summary>
        <h2><code>${model.name}</code></h2>
      </summary>
      ${modelBodyHtml(model)}
      ${modelExample(model)}
    </details>
  </section>
  `

const authBadge = `
<svg class="auth-badge" title="This request is authenticated." alt="This request is authenticated." xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
</svg>
`

const paginated = `
<svg class="paginated" title="This request is paginated." alt="This request is paginated." xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
  <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
  <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
</svg>
`

const error = `
<svg class="error" title="This response is an error." alt="This response is an error." xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
</svg>
`

const queryParams = (qp: Request['queryParams']) =>
  qp.length
    ? `
    <details>
    <summary><h5>Query Parameters</h5></summary>
    ${qp.map((p) => propertyHtml(p.property))}
    </details>
    `
    : ''

const operationToHtml = (route: Route, verb: HTTPVerb, operation: Operation) =>
  `
  <section class="operation">
    <details>
      <summary>
        <h3 id=${operationSlug(route, verb)}>
          ${httpVerbChip(route)(verb)}
          ${operation.authenticated ? authBadge : ''}
          <code>${highlightRoutePath(route.path)}</code>
          ${link(operationSlug(route, verb))}
        </h3>
      </summary>
      ${md.render(operation.description || '')}
      ${
        operation.request
          ? `
          <details>
            <summary><h4>Request</h4></summary>
            ${queryParams(operation.request.queryParams)}
            ${modelBodyHtml(operation.request.content)}
            ${modelExample(operation.request.content)}
          </details>
          `
          : ''
      }
      ${operation.responses
        .sort((a, b) => a.status - b.status)
        .map(
          (response) =>
            `
        <details>
          <summary>
            <h4>Response ${response.status}</h4>
            ${'paginated' in response && response.paginated ? paginated : ''}
            ${'err' in response ? error : ''}
          </summary>
          ${
            'err' in response
              ? response.err === 'zod error'
                ? `
<span>This error is a validation error; it will contain errors reported by <a href="https://www.npmjs.com/package/zod">Zod</a></span>.
<pre class="example"><code><span class="example-text">Example</span>
{
    error: <span class="boolean">true</span>,
    data: {
        status: <span class="number">${response.status}</span>,
        message: <span class="string">"Input validation error; see issues for details"</span>,
        issues: [
          ... (zod errors)
        ]
    }
}
</code></pre>
                `
                : `
<pre class="example"><code><span class="example-text">Example</span>
{
    error: <span class="boolean">true</span>,
    data: {
        status: <span class="number">${response.status}</span>,
        message: <span class="string">"${response.err}"</span>
    }
}
</code></pre>
                `
              : response.content
              ? `
                  ${modelBodyHtml(response.content)}
                  ${modelExample(response.content)}
                  `
              : '(no content)'
          }
        </details>
        `
        )
        .join('\n')}
    </details>
  </section>
  `

const routeToHtml = (route: Route) =>
  `
  <section id="${routeSlug(route)}" class="route">
    <details>
      <summary>
        <header>
          <h2><a href="#${routeSlug(route)}"><code>${highlightRoutePath(
    route.path
  )}</code></a></h2>
          ${Object.keys(route.operations).map(httpVerbChip(route)).join('')}
          ${link(routeSlug(route))}
        </header>
      </summary>
      ${Object.entries(route.operations)
        .map(([verb, operation]) =>
          operationToHtml(route, verb as HTTPVerb, operation)
        )
        .join('\n')}
    </details>
  </section>
  `

// https://stackoverflow.com/a/62765924
const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem)
    if (!previous[group]) previous[group] = []
    previous[group].push(currentItem)
    return previous
  }, {} as Record<K, T[]>)

export const expandRoutes = (routes: Route[]): Route[] =>
  routes.concat(routes.map((r) => expandRoutes(r.subroutes)).flat())

const routesToHtml = (routes: Route[]): string => {
  return Object.values(groupBy(routes, (r) => r.path.split('/')[1]))
    .flat()
    .map(routeToHtml)
    .concat(routes.map((r) => routesToHtml(r.subroutes)))
    .join('')
}

const modelsToHtml = (models: Model[]) => models.map(modelToHtml).join('')

const modelsOutline = (models: Model[]) =>
  '<ul><li class="model">' +
  models
    .map(({ name }) => `<a href="#${modelSlug(name)}"><code>${name}</code></a>`)
    .join('</li><li class="model">') +
  '</li></ul>'

export const toHTML = (
  routes: ObjOf<Route>,
  models: ObjOf<Model>,
  meta: Meta
) => {
  return template({
    routeContent: routesToHtml(Object.values(routes)),
    routeOutline: routesOutline(Object.values(routes)),
    modelContent: modelsToHtml(Object.values(models)),
    modelOutline: modelsOutline(Object.values(models)),
    meta,
  })
}

const http = require('http')
const https = require('https')
const { URL } = require('url')

const SECONDARY_SERVERS = [
  {
    ruid: '9469718789b94dab84558fdb069345ff',
    name: 'one',
  },
  {
    ruid: '2ee9bad51fe63c307fbb7f934bfe4217',
    name: 'two',
  },
]

const PORT = 3000
const TARGET_HOST = 'hetrixtools.com'
const REPORTS_HOST = 'hetrixtools.com'
const MAIN_RUID = '3c862375efedd549a96eb7a682ee35d2'
const TARGET_URL = `https://${TARGET_HOST}`
const STATUS_PATH = `/r/${MAIN_RUID}`

const DATA_RAW =
  'draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=7&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=8&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=false&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=9&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=false&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=-1&search%5Bvalue%5D=&search%5Bregex%5D=false'

function modifyHtmlContent(body, requestUrl) {
  let modifiedBody = body.replace(new RegExp(TARGET_URL, 'g'), '')
  modifiedBody = modifiedBody.replace(new RegExp(`/r/${MAIN_RUID}`, 'g'), '/')

  if (
    requestUrl === '/' ||
    requestUrl === '' ||
    requestUrl.startsWith('/report/uptime/')
  ) {
    console.log('Applying custom HTML modifications for special pages')

    modifiedBody = modifiedBody.replace(
      '<div class="container">',
      '<div class="container" style="text-align:center">'
    )

    modifiedBody = modifiedBody.replace(
      '<div class="page-header-top" id="page-header-top">',
      '<div class="page-header-top" style="background-color: #48525e">'
    )

    modifiedBody = modifiedBody.replace(
      'www.googletagmanager.com',
      'example.com'
    )

    modifiedBody = modifiedBody.replace('www.clarity.ms', 'example.com')

    modifiedBody = modifiedBody.replace(
      /<a href="\.\/uptime-monitor\/" id="zilogo">/g,
      '<a href="/" id="zilogo">'
    )

    modifiedBody = modifiedBody.replace(
      /<img[^>]*src="\.\/img\/ht_logo\.png"[^>]*>/g,
      '<img src="https://i.hetrix.io/status.foxomy.com/9e1ea2/logo.jpeg" alt="HetrixTools" class="logo-default" style="text-align: center; max-height: 100px; max-width: 100%; margin: 12px 0 12px 0">'
    )

    modifiedBody = modifiedBody.replace(
      '<div class="page-footer">',
      '<div class="page-footer" style="padding: 30px 0; background: #48525e">'
    )
  }

  if (requestUrl.startsWith('/report/uptime/')) {
    modifiedBody = modifiedBody.replace(
      /(<span style="vertical-align:sub;">)(\s*)/g,
      '$1<a id="backlnk" href="javascript:window.history.back();" data-toggle="tooltip" data-placement="top" title="" data-original-title="Back"><i class="fa fa-arrow-left" style="font-size:20px;"></i></a>&nbsp;&nbsp;$2'
    )
  }

  const fixScript = `
  <script>
    // w
  </script>
  <style>
    .logo-default {
		max-height: 100px;
		max-width: 100%;
	}
  </style>
  `

  modifiedBody = modifiedBody.replace('</head>', fixScript + '</head>')

  return modifiedBody
}

function normalizeCategoryName(categoryName) {
  return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function extractServerName(row) {
  const m = row[1].match(/<strong>([^<]+)<\/strong>/)
  return m ? m[1] : ''
}

function extractCategoryInfo(row) {
  const lastCol = row[row.length - 1]
  const m = lastCol.match(
    /html\('<i class="fa fa-caret-down" aria-hidden="true" id="CatI_([^"]+)"><\/i> ([^']+)'/
  )
  if (!m) return null
  return {
    categoryId: m[1],
    categoryName: m[2],
    normalizedName: normalizeCategoryName(m[2]),
  }
}

function processRuidJson(jsonData) {
  const servers = []
  const categoryMap = {}

  jsonData.data.forEach((row) => {
    const info = extractCategoryInfo(row)
    if (info)
      categoryMap[info.categoryId] = {
        name: info.categoryName,
        normalizedName: info.normalizedName,
      }
  })

  jsonData.data.forEach((row) => {
    const serverName = extractServerName(row)
    const catIdMatch = row[1].match(/secondcol\s+([a-f0-9]{32})/)
    let category = null

    if (catIdMatch && categoryMap[catIdMatch[1]]) {
      const tmp = categoryMap[catIdMatch[1]]
      category = {
        id: catIdMatch[1],
        name: tmp.name,
        normalizedName: tmp.normalizedName,
      }
    }

    const cleanRow = [...row]
    if (cleanRow.length) {
      let col = cleanRow[cleanRow.length - 1]
      col = col
        .replace(
          /<script>\$\('#datatable_products tr:eq\(\d+\)'\)\.before.*?<\/script>/,
          ''
        )
        .replace(
          /<script>\$\('#datatable_products tr:eq\(\d+\) th:eq\(0\)'\)\.html.*?<\/script>/,
          ''
        )
        .replace(/<script>if\(!.*?<\/script>/, '')
        .replace(
          /<script>\$\('#datatable_products tr:eq\(\d+\) th'\).*?<\/script>/,
          ''
        )
        .replace(/<script>\$\('#CatH_.*?<\/script>/, '')
        .replace(/<script>\$\('.CatS_.*?<\/script>/, '')

      if (!category && serverName && col.includes("'Name'")) {
        const nameScript =
          "$('#datatable_products tr:eq(1) th:eq(0)').html('Name').css('padding-left','10px');$('#datatable_products thead tr:eq(1)').show();$('#datatable_products tr:eq(0)').show().css('height','15px');"
        col = col.replace(
          /\$\('#datatable_products tr:eq\(\d+\)'\)\.html\('Name'\).*?;/,
          nameScript
        )
      }
      cleanRow[cleanRow.length - 1] = col
    }

    servers.push({ name: serverName, category, row: cleanRow })
  })

  return {
    servers,
    recordsTotal: jsonData.recordsTotal,
    recordsFiltered: jsonData.recordsFiltered,
    draw: jsonData.draw,
    data: jsonData.data,
  }
}

function mergeRuidJsons(jsonObjects) {
  const processedFiles = jsonObjects.map(processRuidJson)

  const allServers = processedFiles.flatMap((f) => f.servers)
  const serversByCategory = {}
  const uncategorized = []

  allServers.forEach((s) => {
    if (s.category) {
      const n = s.category.normalizedName
      ;(serversByCategory[n] ||= {
        name: s.category.name,
        normalizedName: n,
        servers: [],
      }).servers.push(s)
    } else {
      uncategorized.push(s)
    }
  })

  const sortedCategories = Object.values(serversByCategory).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  sortedCategories.forEach((c) =>
    c.servers.sort((a, b) => a.name.localeCompare(b.name))
  )
  uncategorized.sort((a, b) => a.name.localeCompare(b.name))

  const mergedData = []

  uncategorized.forEach((s, idx) => {
    const row = [...s.row]

    if (idx === 0 && row.length) {
      let last = row[row.length - 1]
      const dateScriptMatch = last.match(
        /<script>\n\t\t\$\('\.dayz0'.*?<\/script>/s
      )
      let dateScript = ''
      if (dateScriptMatch) {
        dateScript = dateScriptMatch[0]
        last = last.replace(dateScriptMatch[0], '')
      }
      last = last.replace(
        /<script>\$\('#datatable_products tr:eq\(\d+\)'\)\.html\('Name'.*?<\/script>/,
        ''
      )
      last +=
        dateScript +
        "<script>$('#datatable_products tr:eq(1) th:eq(0)').html('Name').css('padding-left','10px');$('#datatable_products thead tr:eq(1)').show();$('#datatable_products tr:eq(0)').show().css('height','15px');</script>"
      row[row.length - 1] = last
    }
    mergedData.push(row)
  })

  let rowIndex = uncategorized.length + 2
  sortedCategories.forEach((cat) => {
    cat.servers.forEach((s, i) => {
      const row = [...s.row]
      if (row[1])
        row[1] = row[1].replace(
          /secondcol\s+[a-f0-9]{32}/,
          `secondcol ${cat.normalizedName}`
        )

      if (i === 0) {
        row[row.length - 1] +=
          `<script>$('#datatable_products tr:eq(${rowIndex})').before('<tr role="row" class="heading" id="CatH_${cat.normalizedName}">'+$('.heading').html()+'</tr>');</script>` +
          `<script>$('#datatable_products tr:eq(${rowIndex}) th:eq(0)').html('<i class="fa fa-caret-down" aria-hidden="true" id="CatI_${cat.normalizedName}"></i> ${cat.name}').css('padding-left','10px').attr('onclick','cat_switch("${cat.normalizedName}")').css('cursor','pointer').css('vertical-align','middle');</script>` +
          `<script>if(!$('.CatS_${cat.normalizedName}').length) {$('#datatable_products tr:eq(${rowIndex}) th:eq(0)').after('<th style="text-align:right;vertical-align:middle;cursor:pointer;display:none;" onclick="cat_switch(&quot;${cat.normalizedName}&quot;)" class="CatS_${cat.normalizedName} sorting_disabled" rowspan="1" colspan="8"></th>');}</script>` +
          `<script>$('#datatable_products tr:eq(${rowIndex}) th').css('font-size','14px');</script>` +
          `<script>$('#CatH_${cat.normalizedName}').before('<tr style="height: 20px;"></tr>');</script>` +
          `<script>$('.CatS_${cat.normalizedName}').html('<span style="color:#5cb85c"><i class="fa fa-check" aria-hidden="true"></i> Operational (1)</span>');</script>`
      } else {
        row[row.length - 1] += `<script>$('.CatS_${
          cat.normalizedName
        }').html('<span style="color:#5cb85c"><i class="fa fa-check" aria-hidden="true"></i> Operational (${
          i + 1
        })</span>');</script>`
      }
      mergedData.push(row)
      rowIndex++
    })
    rowIndex += 2
  })

  if (mergedData.length) {
    const lastRow = mergedData[mergedData.length - 1]
    let lastCol = lastRow[lastRow.length - 1]

    let overallUptimeScript = ''
    const uptimeMatch = lastCol.match(
      /<i class="fa fa-arrow-up"[^>]*><\/i> ([0-9.]+%) Overall Uptime/
    )
    let uptimeValue = uptimeMatch ? uptimeMatch[1] : ''

    if (!uptimeValue) {
      const uptimeVals = []
      processedFiles.forEach((file) => {
        for (let i = file.data.length - 1; i >= 0; i--) {
          const row = file.data[i]
          if (row.length > 2) {
            const m = row[2].match(
              /<tr><td><b>Overall:&nbsp;<\/td><td>([0-9.]+%)<\/b>/
            )
            if (m) uptimeVals.push(parseFloat(m[1]))
          }
        }
      })
      if (uptimeVals.length)
        uptimeValue =
          (uptimeVals.reduce((a, b) => a + b, 0) / uptimeVals.length).toFixed(
            4
          ) + '%'
      else uptimeValue = '99.9999%'
    }

    overallUptimeScript = `<script>$('.overalluptime').html('<div class="overalluptimein" ><b style="vertical-align:middle;"><i class="fa fa-arrow-up" style="font-size: 18px;"></i> ${uptimeValue} Overall Uptime</b></div>').show();</script>`

    lastCol = lastCol
      .replace(/<script>\$\('.overalluptime'\)[\s\S]*?<\/script>/, '')
      .replace(/<script>\$\('[^']*data-toggle="tooltip"[^]*?<\/script>/, '')
      .replace(/<script>\$\('.dbbtns'\)[\s\S]*?<\/script>/, '')
      .replace(/<script>\$\('#ann_row'\)[\s\S]*?<\/script>/, '')
      .replace(/<script>stop_umonref[\s\S]*?<\/script>/, '')
      .replace(/<script>var favicon[\s\S]*?<\/script>/, '')

    lastCol +=
      overallUptimeScript +
      "<script>$('[data-toggle=\"tooltip\"]').tooltip({html:true});$('[data-toggle=\"popover\"]').popover({html:true});$('.secondcol').closest('td').addClass('secondcol');</script>" +
      "<script>stop_umonref();start_umonref(60000);if(!$('#searchthis').is(':visible')) {init_search();}</script>" +
      "<script>var favicon=new Favico({bgColor:'#5cb85c',animation:'none'});favicon.badge(' ');</script>"

    lastRow[lastRow.length - 1] = lastCol
  }

  const totalRecords = processedFiles.reduce((s, f) => s + f.recordsTotal, 0)
  const totalFiltered = processedFiles.reduce(
    (s, f) => s + f.recordsFiltered,
    0
  )
  const maxDraw = Math.max(...processedFiles.map((f) => f.draw))

  return {
    data: mergedData,
    draw: maxDraw,
    recordsTotal: totalRecords,
    recordsFiltered: totalFiltered,
  }
}

function fixHtmlStructure(jsonData) {
  jsonData.data.forEach((row) => {
    for (let i = 3; i < 10; i++) {
      if (
        row[i] &&
        row[i].startsWith('<span class="mob">') &&
        !row[i].endsWith('</span>')
      ) {
        row[i] += '</span>'
      }
    }
  })
  return jsonData
}

function fetchRuidReport(ruid, date, mob) {
  return new Promise((resolve, reject) => {
    const bodyBuffer = Buffer.from(DATA_RAW)
    const options = {
      method: 'POST',
      hostname: REPORTS_HOST,
      port: 443,
      path: `/db_report-bulk.php?RUID=${ruid}&date=${date}&mob=${mob}`,
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Referer: `https://${REPORTS_HOST}/r/${ruid}/`,
        'content-length': bodyBuffer.length,
      },
    }
    const req = https.request(options, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch (e) {
          reject(new Error(`Invalid JSON for ${ruid}: ${e.message}`))
        }
      })
    })
    req.on('error', reject)
    req.write(bodyBuffer)
    req.end()
  })
}

const server = http.createServer((clientReq, clientRes) => {
  if (clientReq.method === 'OPTIONS') {
    clientRes.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Requested-With',
    })
    clientRes.end()
    return
  }

  console.log(`Proxying: ${clientReq.method} ${clientReq.url}`)

  if (
    clientReq.method === 'POST' &&
    clientReq.url.includes('/db_report-bulk.php')
  ) {
    console.log(
      `⚡ Hijacking db_report-bulk.php request! Merging data from ${SECONDARY_SERVERS.length} secondary servers...`
    )
    const urlParams = new URL(
      clientReq.url.startsWith('http')
        ? clientReq.url
        : `http://localhost${clientReq.url}`
    ).searchParams

    const date = urlParams.get('date') || '2025-04-20'
    const mob = urlParams.get('mob') || '0'

    console.log(`Date: ${date}, Mob: ${mob}`)

    let requestBody = ''
    clientReq.on('data', (chunk) => {
      requestBody += chunk.toString()
    })

    clientReq.on('end', async () => {
      const bodyBuffer = Buffer.from(requestBody)

      const mainOptions = {
        method: 'POST',
        hostname: REPORTS_HOST,
        port: 443,
        path: `/db_report-bulk.php?RUID=${MAIN_RUID}&date=${date}&mob=${mob}`,
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: `https://${REPORTS_HOST}/r/${MAIN_RUID}/`,
          'content-length': bodyBuffer.length,
        },
      }

      const mainReq = https.request(mainOptions, (mainRes) => {
        const mainChunks = []

        mainRes.on('data', (chunk) => {
          mainChunks.push(chunk)
        })

        mainRes.on('end', async () => {
          try {
            const mainBuffer = Buffer.concat(mainChunks)
            const mainData = mainBuffer.toString('utf8')

            if (mainData.length < 100 || !mainData.trim().startsWith('{')) {
              console.error('Invalid JSON response from main server:')
              console.error(
                mainBuffer.toString('hex').substring(0, 100) + '...'
              )
              clientRes.writeHead(500, { 'Content-Type': 'text/plain' })
              clientRes.end('Invalid JSON response from main server')
              return
            }

            try {
              const mainJsonData = JSON.parse(mainData)

              try {
                console.log(
                  `Fetching data from ${SECONDARY_SERVERS.length} secondary servers...`
                )

                const secondaryJsons = await Promise.all(
                  SECONDARY_SERVERS.map((s) =>
                    fetchRuidReport(s.ruid, date, mob)
                  )
                )

                let mergedJson = mergeRuidJsons([
                  mainJsonData,
                  ...secondaryJsons,
                ])

                // mergedJson = fixHtmlStructure(mergedJson);

                clientRes.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                })
                clientRes.end(JSON.stringify(mergedJson))
              } catch (error) {
                console.error(
                  'Error fetching or merging secondary data:',
                  error
                )
                clientRes.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                })
                clientRes.end(mainData)
              }
            } catch (error) {
              console.error('Error parsing main data:', error)
              console.error(
                'First 100 chars of main data:',
                mainData.substring(0, 100)
              )
              clientRes.writeHead(500, { 'Content-Type': 'application/json' })
              clientRes.end(
                JSON.stringify({
                  error: 'Failed to parse main data',
                  details: error.message,
                })
              )
            }
          } catch (error) {
            console.error('Error processing main response:', error)
            clientRes.writeHead(500, { 'Content-Type': 'application/json' })
            clientRes.end(
              JSON.stringify({ error: 'Error processing main response' })
            )
          }
        })
      })

      mainReq.on('error', (error) => {
        console.error('Error fetching main data:', error)
        clientRes.writeHead(500, { 'Content-Type': 'application/json' })
        clientRes.end(JSON.stringify({ error: 'Failed to fetch main data' }))
      })

      mainReq.write(bodyBuffer)
      mainReq.end()
    })

    return
  }

  let targetPath = clientReq.url
  if (clientReq.url === '/' || clientReq.url === '') {
    console.log('Handling root request, fetching status page...')

    const statusOptions = {
      method: 'GET',
      hostname: TARGET_HOST,
      port: 443,
      path: STATUS_PATH,
      headers: {
        host: TARGET_HOST,
        'user-agent': clientReq.headers['user-agent'] || 'Node.js Proxy',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'identity',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
      },
    }

    console.log(
      `Fetching status page from https://${TARGET_HOST}${STATUS_PATH}`
    )

    const statusReq = https.request(statusOptions, (statusRes) => {
      console.log(`Status page response: ${statusRes.statusCode}`)

      const responseHeaders = {
        'content-type': statusRes.headers['content-type'] || 'text/html',
        'access-control-allow-origin': '*',
      }

      if (statusRes.statusCode >= 300 && statusRes.statusCode < 400) {
        console.log(`Redirect detected: ${statusRes.headers.location}`)
        const redirectUrl = new URL(
          statusRes.headers.location.startsWith('http')
            ? statusRes.headers.location
            : `https://${TARGET_HOST}${statusRes.headers.location}`
        )

        console.log(`Following redirect to: ${redirectUrl.href}`)

        const redirectOptions = {
          method: 'GET',
          hostname: redirectUrl.hostname,
          port: 443,
          path: redirectUrl.pathname + redirectUrl.search,
          headers: statusOptions.headers,
        }

        const redirectReq = https.request(redirectOptions, (redirectRes) => {
          let body = ''
          redirectRes.on('data', (chunk) => {
            body += chunk.toString()
          })

          redirectRes.on('end', () => {
            console.log(`Redirect response received (${body.length} bytes)`)

            body = body.replace(new RegExp(TARGET_URL, 'g'), '')
            body = body.replace(new RegExp(`/r/${MAIN_RUID}`, 'g'), '/')

            const fixScript = `
			  <script>
				// w
			  </script>
			  `

            body = body.replace('</head>', fixScript + '</head>')

            const modifiedBody = modifyHtmlContent(body, clientReq.url)

            clientRes.writeHead(200, responseHeaders)
            clientRes.end(modifiedBody)
          })
        })

        redirectReq.on('error', (err) => {
          console.error('Redirect error:', err)
          clientRes.writeHead(500, { 'Content-Type': 'text/plain' })
          clientRes.end(`Error following redirect: ${err.message}`)
        })

        redirectReq.end()
        return
      }

      let body = ''
      statusRes.on('data', (chunk) => {
        body += chunk.toString()
      })

      statusRes.on('end', () => {
        console.log(`Status page received (${body.length} bytes)`)

        if (body.length === 0) {
          console.error('Empty response received')
          clientRes.writeHead(500, { 'Content-Type': 'text/plain' })
          clientRes.end('Error: Empty response received from status page')
          return
        }

        body = body.replace(new RegExp(TARGET_URL, 'g'), '')
        body = body.replace(new RegExp(`/r/${MAIN_RUID}`, 'g'), '/')

        const fixScript = `
		  <script>
			// w
		  </script>
		  `

        body = body.replace('</head>', fixScript + '</head>')

        clientRes.writeHead(200, responseHeaders)
        clientRes.end(body)
      })
    })

    statusReq.on('error', (err) => {
      console.error('Error fetching status page:', err)
      clientRes.writeHead(500, { 'Content-Type': 'text/plain' })
      clientRes.end(`Error fetching status page: ${err.message}`)
    })

    statusReq.end()
    return
  }

  const parsedUrl = new URL(
    clientReq.url.startsWith('http') ? clientReq.url : TARGET_URL + targetPath
  )

  const options = {
    method: clientReq.method,
    hostname: TARGET_HOST,
    port: 443,
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      ...clientReq.headers,
      host: TARGET_HOST,
      referer: TARGET_URL,
      origin: TARGET_URL,
      'accept-encoding': 'identity',
    },
  }

  delete options.headers['connection']

  const proxyReq = https.request(options, (proxyRes) => {
    const responseHeaders = {
      ...proxyRes.headers,
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers':
        'Content-Type, Authorization, X-Requested-With',
    }

    delete responseHeaders['content-security-policy']
    delete responseHeaders['content-security-policy-report-only']
    delete responseHeaders['strict-transport-security']

    if (responseHeaders.location) {
      if (responseHeaders.location.includes(`/r/${MAIN_RUID}`)) {
        responseHeaders.location = '/'
      } else {
        responseHeaders.location = responseHeaders.location.replace(
          TARGET_URL,
          ''
        )
      }
    }

    const isHtml =
      responseHeaders['content-type'] &&
      responseHeaders['content-type'].includes('text/html')

    clientRes.writeHead(proxyRes.statusCode, responseHeaders)
    if (isHtml) {
      let responseBody = ''

      proxyRes.on('data', (chunk) => {
        responseBody += chunk.toString()
      })

      proxyRes.on('end', () => {
        responseBody = responseBody.replace(new RegExp(TARGET_URL, 'g'), '')

        responseBody = responseBody.replace(
          new RegExp(`/r/${MAIN_RUID}`, 'g'),
          '/'
        )

        const fixScript = `
        <script>
          (function() {
            var originalPushState = history.pushState;
            var originalReplaceState = history.replaceState;
            
            history.pushState = function() {
              console.log('Safe pushState called');
              return true;
            };
            
            history.replaceState = function() {
              console.log('Safe replaceState called');
              return true;
            };
            
            var originalXhrOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
              if (typeof url === 'string') {
                if (url.includes('${TARGET_HOST}')) {
                  url = url.replace(/https?:\\/\\/${TARGET_HOST}/g, '');
                }
                if (url.includes('${REPORTS_HOST}')) {
                  url = url.replace(/https?:\\/\\/${REPORTS_HOST}/g, '');
                }
                
                url = url.replace(/\\/r\\/${MAIN_RUID}/g, '/');
              }
              return originalXhrOpen.apply(this, [method, url].concat(Array.prototype.slice.call(arguments, 2)));
            };
            
            if (window.jQuery) {
              jQuery.ajaxPrefilter(function(options) {
                if (options.url) {
                  if (options.url.includes('${TARGET_HOST}')) {
                    options.url = options.url.replace(/https?:\\/\\/${TARGET_HOST}/g, '');
                    options.crossDomain = false;
                  }
                  if (options.url.includes('${REPORTS_HOST}')) {
                    options.url = options.url.replace(/https?:\\/\\/${REPORTS_HOST}/g, '');
                    options.crossDomain = false;
                  }
                  
                  options.url = options.url.replace(/\\/r\\/${MAIN_RUID}/g, '/');
                }
              });
            }
            
            document.addEventListener('DOMContentLoaded', function() {
              document.querySelectorAll('a[href]').forEach(function(link) {
                if (link.href) {
                  if (link.href.includes('${TARGET_HOST}')) {
                    link.href = link.href.replace(/https?:\\/\\/${TARGET_HOST}/g, '');
                  }
                  if (link.href.includes('${REPORTS_HOST}')) {
                    link.href = link.href.replace(/https?:\\/\\/${REPORTS_HOST}/g, '');
                  }
                  
                  link.href = link.href.replace(/\\/r\\/${MAIN_RUID}\\/?$/g, '/');
                  link.href = link.href.replace(/\\/r\\/${MAIN_RUID}\\//g, '/');
                }
              });
              
              document.querySelectorAll('form').forEach(function(form) {
                if (form.action) {
                  if (form.action.includes('${TARGET_HOST}')) {
                    form.action = form.action.replace(/https?:\\/\\/${TARGET_HOST}/g, '');
                  }
                  if (form.action.includes('${REPORTS_HOST}')) {
                    form.action = form.action.replace(/https?:\\/\\/${REPORTS_HOST}/g, '');
                  }
                  
                  form.action = form.action.replace(/\\/r\\/${MAIN_RUID}\\/?$/g, '/');
                  form.action = form.action.replace(/\\/r\\/${MAIN_RUID}\\//g, '/');
                }
              });
            });
          })();
        </script>
        `

        responseBody = responseBody.replace('</head>', fixScript + '</head>')

        const modifiedBody = modifyHtmlContent(responseBody, clientReq.url)

        clientRes.end(modifiedBody)
      })
    } else {
      proxyRes.pipe(clientRes)
    }
  })

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err)
    clientRes.writeHead(500, { 'Content-Type': 'text/plain' })
    clientRes.end(`Proxy Error: ${err.message}`)
  })

  if (!clientReq.headers['content-length']) {
    proxyReq.end()
  } else {
    clientReq.pipe(proxyReq)
  }
})

server.listen(PORT, () => {
  console.log(`Reverse proxy server running at http://localhost:${PORT}`)
  console.log(`Proxying main page from ${TARGET_URL}${STATUS_PATH}`)
  console.log(`Using ${REPORTS_HOST} for data requests`)
  console.log(
    `Main status page at ${TARGET_URL}${STATUS_PATH} will be served at /`
  )
  console.log(`Merging data from ${SECONDARY_SERVERS.length} secondary servers`)
})

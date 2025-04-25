const fs = require('fs')
const path = require('path')

function normalizeCategoryName(categoryName) {
  return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function extractServerName(row) {
  const secondColumn = row[1]
  const match = secondColumn.match(/<strong>([^<]+)<\/strong>/)
  return match ? match[1] : ''
}

function extractCategoryInfo(row) {
  const lastCol = row[row.length - 1]

  const categoryMatch = lastCol.match(
    /html\('<i class="fa fa-caret-down" aria-hidden="true" id="CatI_([^"]+)"><\/i> ([^']+)'/
  )
  if (categoryMatch) {
    const categoryId = categoryMatch[1]
    const categoryName = categoryMatch[2]
    const normalizedName = normalizeCategoryName(categoryName)

    return {
      categoryId,
      categoryName,
      normalizedName,
    }
  }

  return null
}

function processRuidFile(filePath) {
  console.log(`Processing ${filePath}...`)
  const rawData = fs.readFileSync(filePath, 'utf8')
  const jsonData = JSON.parse(rawData)

  const servers = []
  const categoryMap = {}

  jsonData.data.forEach((row) => {
    const categoryInfo = extractCategoryInfo(row)
    if (categoryInfo) {
      categoryMap[categoryInfo.categoryId] = {
        name: categoryInfo.categoryName,
        normalizedName: categoryInfo.normalizedName,
      }
    }
  })

  jsonData.data.forEach((row) => {
    const serverName = extractServerName(row)

    const secondCol = row[1]
    const categoryIdMatch = secondCol.match(/secondcol\s+([a-f0-9]{32})/)

    let category = null
    if (categoryIdMatch && categoryMap[categoryIdMatch[1]]) {
      const categoryId = categoryIdMatch[1]
      category = {
        id: categoryId,
        name: categoryMap[categoryId].name,
        normalizedName: categoryMap[categoryId].normalizedName,
      }
    }

    const cleanRow = [...row]
    if (cleanRow.length > 0) {
      let lastCol = cleanRow[cleanRow.length - 1]

      lastCol = lastCol.replace(
        /<script>\$\('#datatable_products tr:eq\(\d+\)'\)\.before.*?<\/script>/,
        ''
      )
      lastCol = lastCol.replace(
        /<script>\$\('#datatable_products tr:eq\(\d+\) th:eq\(0\)'\)\.html.*?<\/script>/,
        ''
      )
      lastCol = lastCol.replace(/<script>if\(!.*?<\/script>/, '')
      lastCol = lastCol.replace(
        /<script>\$\('#datatable_products tr:eq\(\d+\) th'\).*?<\/script>/,
        ''
      )
      lastCol = lastCol.replace(/<script>\$\('#CatH_.*?<\/script>/, '')
      lastCol = lastCol.replace(/<script>\$\('.CatS_.*?<\/script>/, '')

      if (!category && serverName && lastCol.includes("'Name'")) {
        const nameScript =
          "$('#datatable_products tr:eq(1) th:eq(0)').html('Name').css('padding-left','10px');$('#datatable_products thead tr:eq(1)').show();$('#datatable_products tr:eq(0)').show().css('height','15px');"
        lastCol = lastCol.replace(
          /\$\('#datatable_products tr:eq\(\d+\)'\)\.html\('Name'\).*?;/,
          nameScript
        )
      }

      cleanRow[cleanRow.length - 1] = lastCol
    }

    servers.push({
      name: serverName,
      category: category,
      row: cleanRow,
    })
  })

  return {
    servers,
    recordsTotal: jsonData.recordsTotal,
    recordsFiltered: jsonData.recordsFiltered,
    draw: jsonData.draw,
  }
}

function mergeRuidFiles(files) {
  const processedFiles = files.map((file) => processRuidFile(file))

  const allServers = []
  processedFiles.forEach((file) => {
    allServers.push(...file.servers)
  })

  const serversByCategory = {}
  const uncategorizedServers = []

  allServers.forEach((server) => {
    if (server.category) {
      const normalizedName = server.category.normalizedName
      if (!serversByCategory[normalizedName]) {
        serversByCategory[normalizedName] = {
          name: server.category.name,
          normalizedName: normalizedName,
          servers: [],
        }
      }
      serversByCategory[normalizedName].servers.push(server)
    } else {
      uncategorizedServers.push(server)
    }
  })

  const sortedCategories = Object.values(serversByCategory).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  sortedCategories.forEach((category) => {
    category.servers.sort((a, b) => a.name.localeCompare(b.name))
  })

  uncategorizedServers.sort((a, b) => a.name.localeCompare(b.name))

  const totalRecords = processedFiles.reduce(
    (sum, file) => sum + file.recordsTotal,
    0
  )
  const totalFiltered = processedFiles.reduce(
    (sum, file) => sum + file.recordsFiltered,
    0
  )
  const maxDraw = Math.max(...processedFiles.map((file) => file.draw))

  const mergedData = []

  uncategorizedServers.forEach((server, index) => {
    const row = [...server.row]

    if (index === 0 && row.length > 0) {
      let lastCol = row[row.length - 1]
      let dateScript = ''

      const dateScriptMatch = lastCol.match(
        /<script>\n\t\t\$\('\.dayz0'\)\.html\('.*?'\);\n\t\t\$\('\.dayz1'\)\.text\('.*?'\);\n\t\t\$\('\.dayz2'\)\.text\('.*?'\);\n\t\t\$\('\.dayz3'\)\.text\('.*?'\);\n\t\t\$\('\.dayz4'\)\.text\('.*?'\);\n\t\t\$\('\.dayz5'\)\.text\('.*?'\);\n\t\t\$\('\.dayz6'\)\.text\('.*?'\);\n\t\t<\/script>/
      )

      if (dateScriptMatch) {
        dateScript = dateScriptMatch[0]
        lastCol = lastCol.replace(dateScriptMatch[0], '')
      }

      lastCol = lastCol.replace(
        /<script>\$\('#datatable_products tr:eq\(\d+\)'\)\.html\('Name'\).*?<\/script>/,
        ''
      )

      const nameScript =
        "<script>$('#datatable_products tr:eq(1) th:eq(0)').html('Name').css('padding-left','10px');$('#datatable_products thead tr:eq(1)').show();$('#datatable_products tr:eq(0)').show().css('height','15px');</script>"

      row[row.length - 1] = lastCol + dateScript + nameScript
    }

    mergedData.push(row)
  })

  let rowIndex = uncategorizedServers.length + 2

  sortedCategories.forEach((category) => {
    category.servers.forEach((server, serverIndex) => {
      const row = [...server.row]

      if (row.length > 1) {
        row[1] = row[1].replace(
          /secondcol\s+[a-f0-9]{32}/,
          `secondcol ${category.normalizedName}`
        )
      }

      if (serverIndex === 0 && row.length > 0) {
        const categoryHeaderScript = `<script>$('#datatable_products tr:eq(${rowIndex})').before('<tr role=\"row\" class=\"heading\" id=\"CatH_${category.normalizedName}\">'+$('.heading').html()+'</tr>');</script><script>$('#datatable_products tr:eq(${rowIndex}) th:eq(0)').html('<i class=\"fa fa-caret-down\" aria-hidden=\"true\" id=\"CatI_${category.normalizedName}\"></i> ${category.name}').css('padding-left','10px').attr('onclick','cat_switch(\"${category.normalizedName}\")').css('cursor','pointer').css('vertical-align','middle');</script><script>if(!$('.CatS_${category.normalizedName}').length) {$('#datatable_products tr:eq(${rowIndex}) th:eq(0)').after('<th style=\"text-align:right;vertical-align:middle;cursor:pointer;display:none;\" onclick=\"cat_switch(&quot;${category.normalizedName}&quot;)\" class=\"CatS_${category.normalizedName} sorting_disabled\" rowspan=\"1\" colspan=\"8\"></th>');}</script><script>$('#datatable_products tr:eq(${rowIndex}) th').css('font-size','14px');</script><script>$('#CatH_${category.normalizedName}').before('<tr style=\"height: 20px;\"></tr>');</script><script>$('.CatS_${category.normalizedName}').html('<span style=\"color:#5cb85c\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i> Operational (1)</span>');</script>`

        row[row.length - 1] += categoryHeaderScript
      } else if (row.length > 0) {
        const counterScript = `<script>$('.CatS_${
          category.normalizedName
        }').html('<span style=\"color:#5cb85c\"><i class=\"fa fa-check\" aria-hidden=\"true\"></i> Operational (${
          serverIndex + 1
        })</span>');</script>`

        row[row.length - 1] += counterScript
      }

      mergedData.push(row)
      rowIndex++
    })

    rowIndex += 2
  })

  if (mergedData.length > 0) {
    const lastRow = mergedData[mergedData.length - 1]
    const lastCol = lastRow[lastRow.length - 1]

    let overallUptimeScript = ''
    let uptimeValue = ''

    const overallUptimeMatch = lastCol.match(
      /<script>\$\('.overalluptime'\)\.html\('<div class="overalluptimein" ><b style="vertical-align:middle;"><i class="fa fa-arrow-up" style="font-size: 18px;"><\/i> ([0-9.]+%) Overall Uptime<\/b><\/div>'\)\.show\(\);<\/script>/
    )

    if (overallUptimeMatch && overallUptimeMatch[1]) {
      uptimeValue = overallUptimeMatch[1]
      overallUptimeScript = `<script>$('.overalluptime').html('<div class=\"overalluptimein\" ><b style=\"vertical-align:middle;\"><i class=\"fa fa-arrow-up\" style=\"font-size: 18px;\"></i> ${uptimeValue} Overall Uptime</b></div>').show();</script>`
    } else {
      const uptimeValues = []

      for (let i = 0; i < mergedData.length; i++) {
        const row = mergedData[i]
        if (row.length > 2) {
          const uptimeCol = row[2]

          const overallMatch = uptimeCol.match(
            /<tr><td><b>Overall:&nbsp;<\/td><td>([0-9.]+%)<\/b>/
          )
          if (overallMatch && overallMatch[1]) {
            uptimeValues.push(parseFloat(overallMatch[1]))
          }
        }
      }

      if (uptimeValues.length > 0) {
        const sum = uptimeValues.reduce((acc, val) => acc + val, 0)
        const avg = sum / uptimeValues.length

        uptimeValue = avg.toFixed(4) + '%'
      } else {
        const filesUptimeValues = processedFiles
          .map((file) => {
            for (let i = file.data.length - 1; i >= 0; i--) {
              const row = file.data[i]
              if (row.length > 0) {
                const lastCol = row[row.length - 1]
                const match = lastCol.match(
                  /Overall Uptime<\/b><\/div>'\)\.show\(\);<\/script>/
                )
                if (match) {
                  const valueMatch = lastCol.match(
                    /<i class="fa fa-arrow-up"[^>]*><\/i> ([0-9.]+%) Overall Uptime<\/b>/
                  )
                  if (valueMatch) {
                    return valueMatch[1]
                  }
                }
              }
            }
            return null
          })
          .filter(Boolean)

        if (filesUptimeValues.length > 0) {
          uptimeValue = filesUptimeValues[filesUptimeValues.length - 1]
        } else {
          uptimeValue = '99.9999%'
        }
      }

      overallUptimeScript = `<script>$('.overalluptime').html('<div class=\"overalluptimein\" ><b style=\"vertical-align:middle;\"><i class=\"fa fa-arrow-up\" style=\"font-size: 18px;\"></i> ${uptimeValue} Overall Uptime</b></div>').show();</script>`
    }

    let ruidValue = '2ee9bad51fe63c307fbb7f934bfe4217'
    const ruidMatch = lastCol.match(/RUID': '([^']+)'/)
    if (ruidMatch) {
      ruidValue = ruidMatch[1]
    }

    let dateValue = '2025-04-24'
    const dateMatch = lastCol.match(/date': '([^']+)'/)
    if (dateMatch) {
      dateValue = dateMatch[1]
    }

    let announcementScript = ''
    const announcementMatch = lastCol.match(
      /<script>\$\('#ann_row'\)\.html\('.*?<\/script>/
    )
    if (announcementMatch) {
      announcementScript = announcementMatch[0]
    } else {
      announcementScript =
        '<script>$(\'#ann_row\').html(\'<div class="col-md-12">\\\n\t\t\t\t<div class="note  note-bordered" style="background-color:#ffffff;border-color:#d2d2d2;border-top: 1px solid #d2d2d2;border-bottom: 1px solid #d2d2d2;border-right: 1px solid #d2d2d2;">\\\n\t\t\t\t\t<h4 class="block" style="font-size: 24px;font-weight:600;margin-bottom: 0px;""><span style="color:#333;">This is not an official status page. Inaccurate information</span></h4>\\\n\t\t\t\t\t<div></div>\\\n\t\t\t\t</div>\\\n\t\t\t</div>\')</script>'
    }

    const finalScripts = `${overallUptimeScript}<script>$('[data-toggle=\"tooltip\"]').tooltip({html:true});$('[data-toggle=\"popover\"]').popover({html:true});$('.secondcol').closest('td').addClass('secondcol');</script><script>$('.dbbtns').load('bulk_rep_buttons.php', {'date': '${dateValue}' , 'RUID': '${ruidValue}' , 'ori': 'x'});</script>${announcementScript}<script>stop_umonref();start_umonref(60000);if(!$('#searchthis').is(':visible')) {init_search();}</script><script>var favicon=new Favico({bgColor:'#5cb85c',animation:'none'});favicon.badge(' ');</script>`

    let cleanLastCol = lastCol
    cleanLastCol = cleanLastCol.replace(
      /<script>\$\('.overalluptime'\)\.html\('.*?<\/script>/,
      ''
    )
    cleanLastCol = cleanLastCol.replace(
      /<script>\$\('\[data-toggle="tooltip"\]'\)\.tooltip.*?<\/script>/,
      ''
    )
    cleanLastCol = cleanLastCol.replace(
      /<script>\$\('.dbbtns'\)\.load.*?<\/script>/,
      ''
    )
    cleanLastCol = cleanLastCol.replace(
      /<script>\$\('#ann_row'\)\.html\('.*?<\/script>/,
      ''
    )
    cleanLastCol = cleanLastCol.replace(/<script>stop_umonref.*?<\/script>/, '')
    cleanLastCol = cleanLastCol.replace(/<script>var favicon.*?<\/script>/, '')

    lastRow[lastRow.length - 1] = cleanLastCol + finalScripts
  }

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

function main() {
  let ruidFiles = process.argv.slice(2)

  if (ruidFiles.length === 0) {
    ruidFiles = fs
      .readdirSync('./')
      .filter((file) => file.match(/^ruid\d+\.json$/))
      .sort()

    if (ruidFiles.length < 2) {
      console.error(
        'Error: Not enough RUID files found. Need at least ruid1.json and ruid2.json.'
      )
      process.exit(1)
    }
  }

  console.log(
    `Found ${ruidFiles.length} RUID files to merge: ${ruidFiles.join(', ')}`
  )

  try {
    let mergedJson = mergeRuidFiles(ruidFiles)

    mergedJson = fixHtmlStructure(mergedJson)

    fs.writeFileSync('ruid.json', JSON.stringify(mergedJson, null, 2))
    console.log(`Successfully merged ${ruidFiles.length} files into ruid.json`)
  } catch (error) {
    console.error('Error merging files:', error)
    process.exit(1)
  }
}

main()

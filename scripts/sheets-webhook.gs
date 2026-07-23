const NOTIFY_EMAIL = 'info@aquaviaworld.com'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = ss.getSheetByName('Leads')
    if (!sheet) {
      sheet = ss.insertSheet('Leads')
      sheet.appendRow(['Timestamp (IST)', 'Name', 'Company', 'Email', 'Phone', 'Quantity', 'Message'])
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss'),
      data.name    || '',
      data.company || '',
      data.email   || '',
      data.phone   || '',
      data.quantity|| '',
      data.message || '',
    ])

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New AquaVia enquiry — ${data.name}${data.company ? ' · ' + data.company : ''}`,
      body: [
        `Name:     ${data.name}`,
        `Company:  ${data.company || '—'}`,
        `Email:    ${data.email}`,
        `Phone:    ${data.phone || '—'}`,
        `Quantity: ${data.quantity || '—'}`,
        ``,
        `Message:`,
        data.message || '—',
      ].join('\n'),
    })

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'AquaVia form endpoint active' }))
    .setMimeType(ContentService.MimeType.JSON)
}

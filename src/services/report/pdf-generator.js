const PDFDocument = require("pdfmake")
const fs = require("fs")
const path = require("path")

// Define fonts (you might need to adjust paths based on your system)
const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../../fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../../fonts/Roboto-Bold.ttf"),
    italics: path.join(__dirname, "../../fonts/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "../../fonts/Roboto-BoldItalic.ttf"),
  },
}

// Fallback to default fonts if custom fonts are not available
const defaultFonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
}

async function generatePDF(conversions, stats, date) {
  const docDefinition = {
    content: [
      // Header
      {
        text: "Currency Conversion Daily Report",
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 20],
      },
      {
        text: `Date: ${date.toDateString()}`,
        style: "subheader",
        alignment: "center",
        margin: [0, 0, 0, 30],
      },

      // Summary Statistics
      {
        text: "Summary Statistics",
        style: "sectionHeader",
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: `Total Conversions: ${stats.totalConversions}`, margin: [0, 0, 0, 5] },
              { text: `Total Volume: ${stats.totalVolume.toFixed(2)}`, margin: [0, 0, 0, 5] },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: `Unique Currency Pairs: ${Object.keys(stats.currencyPairs).length}`, margin: [0, 0, 0, 5] },
              {
                text: `Most Active Hour: ${stats.hourlyDistribution.indexOf(Math.max(...stats.hourlyDistribution))}:00`,
                margin: [0, 0, 0, 5],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Top Currency Pairs
      {
        text: "Top Currency Pairs",
        style: "sectionHeader",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto"],
          body: [
            ["Currency Pair", "Conversions"],
            ...stats.topCurrencyPairs.map(([pair, count]) => [pair, count.toString()]),
          ],
        },
        margin: [0, 0, 0, 20],
      },

      // Recent Conversions
      {
        text: "Recent Conversions (Last 20)",
        style: "sectionHeader",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "auto", "*"],
          body: [
            ["From", "To", "Amount", "Converted", "Rate", "Time"],
            ...conversions
              .slice(0, 20)
              .map((conv) => [
                conv.from,
                conv.to,
                conv.amount.toFixed(4),
                conv.convertedAmount.toFixed(4),
                conv.rate.toFixed(6),
                new Date(conv.timestamp).toLocaleTimeString(),
              ]),
          ],
        },
        fontSize: 8,
      },
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: "#2c3e50",
      },
      subheader: {
        fontSize: 14,
        color: "#7f8c8d",
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: "#34495e",
        margin: [0, 10, 0, 5],
      },
    },

    defaultStyle: {
      fontSize: 10,
      font: "Helvetica",
    },
  }

  return new Promise((resolve, reject) => {
    try {
      const printer = new PDFDocument(defaultFonts)
      const chunks = []

      const pdfDoc = printer.createPdfKitDocument(docDefinition)

      pdfDoc.on("data", (chunk) => chunks.push(chunk))
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)))
      pdfDoc.on("error", reject)

      pdfDoc.end()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  generatePDF,
}

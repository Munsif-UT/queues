import moment from "moment"
import Excel from "exceljs"
import _ from "lodash"
export const tokenChecker = (number, format, date) => moment().isBetween(moment(date), moment(date).add(number, format))
export const isEmail = (email) => {
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email);
}

const cell = (x, y) => {
    let colIndex = String.fromCharCode(64 + x);
    if(x > 26){
        colIndex = `${String.fromCharCode(64 + 1)}${String.fromCharCode(64 + x - 26)}`;
    }
    
    return colIndex + y;
  }

export const getExcel = async function (reportName, data, opts = {}) {
    const options = Object.assign({ totals: false, skipTotals: [] }, opts);
    const keys = _.keys(data[0]);
    const workbook = new Excel.Workbook();

    const sheet = workbook.addWorksheet("Report", {
        views: [{ state: "frozen", ySplit: 6 }],
    });
    sheet.autoFilter = {
        from: cell(1, 6),
        to: cell(keys.length, 6),
    };
    sheet.columns = keys.map((k, idx) => ({ key: "col" + idx, width: 25 }));

    // add image to workbook by buffer
    // var img = workbook.addImage({
    //   buffer: fs.readFileSync(
    //     path.join(__dirname, "/../ReportLogo/CarHub-black.png")
    //   ),
    //   extension: "png"
    // });
    // // insert an image over A1:A4
    // sheet.addImage(img, {
    //   tl: { col: 0.5, row: 0.1 },
    //   br: { col: 1.0, row: 4 },
    //   editAs: "absolute"
    // });

    sheet.mergeCells(`A2:${cell(keys.length, 2)}`);
    sheet.getCell("A2").value = reportName;
    sheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell("A2").font = { name: "Calibri", size: 15, bold: true };

    sheet.mergeCells(`A3:${cell(keys.length, 3)}`);
    if (opts.fromDate || opts.toDate) {
        sheet.getCell("A3").value =
            "Report Date: " +
            moment(new Date()).format("DDMMYYYY") +
            " - From: " +
            moment(new Date(opts.fromDate.split(" ").splice(0, 5).join(" "))).format(
                "DDMMYYYY"
            ) +
            " - To: " +
            moment(new Date(opts.toDate.split(" ").splice(0, 5).join(" "))).format(
                "DDMMYYYY"
            );
    } else {
        sheet.getCell("A3").value =
            "Report Date: " + moment(new Date()).format("DDMMYYYY");
    }
    sheet.getCell("A3").alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell("A3").font = { name: "Calibri", size: 15, bold: true };

    keys.forEach((k, idx) => {
        const cellIndex = cell(idx + 1, 6);
        const c = sheet.getCell(cellIndex);
        c.value = k;
        c.alignment = { vertical: "middle", horizontal: "center" };
        c.font = {
            name: "Calibri",
            size: 11,
            bold: true,
            color: { argb: "FFFFFFFF" },
        };
        c.fill = {
            type: "pattern",
            pattern: "solid",
            bgColor: { argb: "FF808080" },
            fgColor: { argb: "FF808080" },
        };
        c.border = {
            top: { style: "medium", color: { argb: "FF000000" } },
            left: { style: "medium", color: { argb: "FF000000" } },
            bottom: { style: "medium", color: { argb: "FF000000" } },
            right: { style: "medium", color: { argb: "FF000000" } },
        };
    });

    const totals = {};
    data.forEach((r, ri) => {
        ri += 6;
        keys.forEach((k, ci) => {
            const cellIndex = cell(ci + 1, ri + 1);
            const c = sheet.getCell(cellIndex);
            if (r[k] && r[k].type === "url") {
                c.font = {
                    name: "Calibri",
                    size: 11,
                    color: { argb: "FF0000FF" },
                    underline: true,
                };

                c.value = {
                    text: r[k].text || r[k].value,
                    hyperlink: r[k].value,
                    tooltip: "Open in Browser",
                };
            } else {
                c.value = r[k];
                c.font = {
                    name: "Calibri",
                    size: 11,
                    color: { argb: "FF000000" },
                };
                if (typeof r[k] === "number") {
                    if (!totals[ci.toString()]) {
                        totals[ci.toString()] = 0;
                    }
                    totals[ci.toString()] += r[k];
                    if (!Number.isInteger(c.value)) {
                        c.numFmt = "#,###.00";
                    } else {
                        c.numFmt = "#,###";
                    }
                }
            }

            c.border = {
                top: { style: "medium", color: { argb: "FF000000" } },
                left: { style: "medium", color: { argb: "FF000000" } },
                bottom: { style: "medium", color: { argb: "FF000000" } },
                right: { style: "medium", color: { argb: "FF000000" } },
            };
        });
    });

    if (options.totals) {
        keys.forEach((k, cIdx) => {
            const cellIndex = cell(cIdx + 1, 6 + data.length + 1);
            const c = sheet.getCell(cellIndex);
            c.fill = {
                type: "pattern",
                pattern: "solid",
                bgColor: { argb: "FF808080" },
                fgColor: { argb: "FF808080" },
            };
            c.font = {
                name: "Calibri",
                size: 11,
                bold: true,
                color: { argb: "F000000" },
            };
            c.border = {
                top: { style: "medium", color: { argb: "FF000000" } },
                left: { style: "medium", color: { argb: "FF000000" } },
                bottom: { style: "medium", color: { argb: "FF000000" } },
                right: { style: "medium", color: { argb: "FF000000" } },
            };
            if (
                typeof totals[cIdx.toString()] === "number" &&
                options.skipTotals.filter((t) => t === k).length === 0
            ) {
                c.value = totals[cIdx.toString()];
                if (!Number.isInteger(c.value)) {
                    c.numFmt = "#,###.00";
                } else {
                    c.numFmt = "#,###";
                }
            }
        });
    }
    return await workbook.xlsx.writeBuffer();
};
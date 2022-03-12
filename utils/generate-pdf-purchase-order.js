import { jsPDF } from "jspdf";
import 'jspdf-autotable';


const generateTableBody = (purchaseOrder) => {
    let parentArray = [];

    purchaseOrder.splitShipments.forEach(splitShipment => {
        let childArray = []
        splitShipment.productsToShip.forEach(products => {
            childArray.push(products.productId);
            childArray.push(products.name || "");
            childArray.push('Total Cartoons 1');
            childArray.push(products.unitsToShip || "");
            childArray.push(`$${products.costPerUnits}` || "")
            childArray.push(`$${(JSON.parse(products.unitsToShip) * JSON.parse(products.costPerUnits))}` || 0)
        });
        parentArray.push(childArray);
    });
    return parentArray;
}

const generateTableForSplitShipments = (shipments) => {

    let parentArray = [];

    shipments.productsToShip && shipments.productsToShip.forEach(products => {
        let childArray = []
        childArray.push(products._id || "")
        childArray.push(products.name || "")
        childArray.push('Total Cartoons 1')
        childArray.push(products.unitsToShip || "")
        parentArray.push(childArray);
    });
    return parentArray;

}

const calculateShippingCost = (purchaseOrder) => {
    let total = 0;
    purchaseOrder.splitShipments.map((value) => {
        if (value.shippingCost) {
            total = total + value.shippingCost;
        }
    });
    return total;
};

export const printDocument = (purchaseOrder) => {

    let d = new Date(purchaseOrder.poDate);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();


    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const centerX = width / 2;
    const centerY = width / 2;
    let left_margin = 5;
    let top_margin = 5;
    let botton_margin = height - top_margin * 2;
    let right_margin = width - left_margin * 2;

    let y = top_margin;
    const x = left_margin;

    //////////////////////heading////////////////////////////////////


    y += 7;
    doc.setFontSize(20);
    doc.setFont('times', 'normal');
    doc.text('INVENTOOLY.COM', x, y);
    y += 5
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.text('106-K Phase 1 DHA Lahore, Lahore, 54000, PK', x, y);
    y += 4
    doc.text('TEL.: 03369372514', x, y);
    y += 4
    doc.text('Email: touseef@inventooly.com', x, y);
    y = 5 + top_margin;
    doc.setFont('times', 'bold')
    doc.setFontSize(8);
    doc.text('Payment Terms:', centerX, y)
    y += 4;
    doc.text('\t100% ', centerX, y)
    doc.setFont("times", "normal");
    doc.text('\t\t advance', centerX, y)
    y = 5 + top_margin;
    doc.setFont('times', 'bold');
    doc.text('Date of PO:', right_margin - 30, y)

    doc.setFont('times', 'normal')
    doc.text(`${day}/${month}/${year}`, right_margin - 15, y)

    y = 40 + top_margin
    doc.setFont('times', 'bold');
    doc.setFontSize(25);
    doc.text(`Purchase Order #: ${purchaseOrder.number || ""}`, centerX, y, 'center')

    const quarter = width / 3;
    y += 8;
    doc.setFont('times', 'normal')
    doc.setFontSize(8)
    doc.text('Vendor Name', quarter / 2, y, 'center')
    doc.text('Sold To', (quarter + quarter / 2), y, 'center');
    doc.text('Ship To', (quarter + quarter + quarter / 2), y, 'center');
    y += 4;

    doc.setFont('times', 'bold');
    doc.text(`${purchaseOrder.supplier || ""}`, quarter / 2, y, 'center');
    doc.text('INVENTOOLY.COM', (quarter + quarter / 2), y, 'center');
    doc.text(`${purchaseOrder.splitShipments.length > 1 ? 'Multiple - See Below' : purchaseOrder.splitShipments[0].destination || ""}`, (quarter + quarter + quarter / 2), y, 'center')

    y += 4;
    doc.setFont('times', 'normal');
    doc.text('106-K Phase 1 DHA Lahore, Lahore, 54792, PK', quarter / 2,
        y, 'center');
    doc.text('106-K Phase 1 DHA Lahore, Lahore, 54792, PK', (quarter +
        quarter / 2), y, 'center');
    doc.text('Amazon Addresses to be determined', (quarter + quarter +
        quarter / 2), y, 'center');

    y += 4;
    doc.setFontSize(10);
    doc.text('TEL.: 03369372514', quarter / 2, y, 'center');
    doc.text('TEL.: 03369372514', (quarter + quarter / 2), y, 'center');

    y += 8;
    doc.setFontSize(8);



    ///////////////////////Table/////////////////////

    y += 5;

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Products Ordered', x, y);

    doc.setFontSize(8);
    doc.setFont('times', 'normal');

    const tableBody = generateTableBody(purchaseOrder);


    y += 4
    doc.autoTable({
        tableLineColor: [189, 195, 199],
        tableLineWidth: 0.75,
        head: [['Internal Part', 'MPN-Product Description', 'Packaging Info',
            'Quantity - Units', 'Cost/Unit', 'Amount']],
        body: tableBody,
        startY: y,
        theme: 'plain'
    });
    let finalY = doc.lastAutoTable.finalY


    ////////////////////////splitshipments////////////////
    let start = finalY
    purchaseOrder.splitShipments && purchaseOrder.splitShipments.length > 1 && purchaseOrder.splitShipments.forEach((shipments, index) => {

        finalY += 10
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text(`${index + 1} Shipment`, x, finalY);
        finalY += 5;

        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.text('shipTo', centerX / 2, finalY, 'center');

        finalY += 5;
        doc.setFont('times', 'bold');
        doc.text(`${shipments.destination || ""}`, centerX / 2, finalY, 'center');
        doc.text(`Required Ship Date: No later than ${shipments.shipBy || ""}`, (centerX + centerX / 2), finalY, 'center');

        finalY += 5;

        doc.setFont('times', 'normal');
        doc.text('Amazon Addresses to be determined.', centerX / 2, finalY, 'center')



        const shipmentBody = generateTableForSplitShipments(shipments)

        finalY += 4
        doc.autoTable({
            tableLineColor: [189, 195, 199],
            tableLineWidth: 0.75,
            head: [['Internal Part', 'MPN-Product Description', 'Packaging Info',
                'Quantity - Units']],
            body: shipmentBody,
            startY: finalY,
            theme: 'plain'
        });
        finalY = doc.lastAutoTable.finalY
        finalY += 5

        doc.setFont('times', 'bold');
        doc.text(`${index + 1} Shipping Cost: $`, x, finalY);

        doc.setFont('times', 'normal');
        doc.text(`${shipments.shippingCost || 0}`, x + 25, finalY);
    })



    //////////////////////footter///////////////
    finalY += 10

    doc.setFontSize(10);
    doc.setFont('times', 'bold');

    doc.text('Subtotal:', right_margin - 50, finalY);
    doc.text(`$${purchaseOrder.subTotal || 0}`, right_margin - 15, finalY);

    finalY += 5;
    // doc.setFont('times','bold');
    doc.text('Shipping:', right_margin - 50, finalY);
    doc.text(`$${calculateShippingCost(purchaseOrder) || 0}`, right_margin - 15, finalY);

    finalY += 5;
    doc.text('Invoice Total:', right_margin - 50, finalY);
    doc.text(`$${purchaseOrder.total || 0}`, right_margin - 15, finalY);

    finalY += 5;
    doc.text('Balance Due:', right_margin - 50, finalY);
    doc.text(`$${purchaseOrder.total || 0}`, right_margin - 15, finalY);

    return doc;
};

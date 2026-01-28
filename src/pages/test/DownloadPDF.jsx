import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function DownloadPDF() {
  const contentRef = useRef(null);

  const handleDownloadPdf = async () => {
    const element = contentRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("my-document.pdf");
  };

  return (
    <div>
      <div ref={contentRef}>
        {/* Your content to be exported */}
        <h1>Hello, PDF!</h1>
        <p>This is some content that will be converted to a PDF.</p>
      </div>
      <button onClick={handleDownloadPdf}>Download PDF</button>
    </div>
  );
}

export default DownloadPDF;

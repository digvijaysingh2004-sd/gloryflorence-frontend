import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
  fileName?: string;
  marginMm?: number;
  orientation?: 'portrait' | 'landscape';
}

export const pdfService = {
  exportElementToPdf: (
    elementOrId: HTMLElement | string,
    options?: PdfExportOptions
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const element =
          typeof elementOrId === 'string'
            ? document.getElementById(elementOrId)
            : elementOrId;

        if (!element) {
          reject(new Error('Target element for PDF export was not found.'));
          return;
        }

        // Clone element or temporarily adjust container for high-res rendering
        const targetFilename = options?.fileName
          ? options.fileName.endsWith('.pdf')
            ? options.fileName
            : `${options.fileName}.pdf`
          : 'document.pdf';

        const opt = {
          margin: options?.marginMm !== undefined ? options.marginMm : 0,
          filename: targetFilename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
            windowWidth: 794,
            ignoreElements: (node: Element) => {
              if (!node || !node.classList) return false;
              return (
                node.classList.contains('no-print') ||
                node.classList.contains('prescription-print-footer-actions') ||
                node.classList.contains('invoice-print-footer-actions') ||
                node.tagName === 'BUTTON'
              );
            },
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: options?.orientation || 'portrait',
          },
        };

        // Safe default import resolution for CommonJS / ESM interop in Vite
        const html2pdfFn =
          typeof html2pdf === 'function'
            ? html2pdf
            : (html2pdf as any)?.default;

        if (typeof html2pdfFn !== 'function') {
          reject(new Error('html2pdf module could not be initialized.'));
          return;
        }

        const optWithPagebreak = {
          ...opt,
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        // Temporarily reset element max-height/overflow to capture full size without scrollbars
        const origMaxHeight = element.style.maxHeight;
        const origOverflow = element.style.overflow;
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';

        const restoreStyles = () => {
          element.style.maxHeight = origMaxHeight;
          element.style.overflow = origOverflow;
        };

        // Create PDF instance and save with promise safety
        const worker = html2pdfFn().set(optWithPagebreak).from(element).save();

        if (worker && typeof worker.then === 'function') {
          worker
            .then(() => {
              restoreStyles();
              resolve();
            })
            .catch((err: any) => {
              restoreStyles();
              reject(err);
            });
        } else {
          restoreStyles();
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default pdfService;

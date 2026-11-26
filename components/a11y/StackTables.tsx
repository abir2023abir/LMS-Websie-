'use client';

import { useEffect } from 'react';

/**
 * Phones: writes each column's name on its table cells, so globals.css can show a table row as a card
 * instead of a table that scrolls sideways. A header cell can set data-label when its text is not a name.
 */
export default function StackTables() {
  useEffect(() => {
    let frame = 0;

    const label = () => {
      frame = 0;
      document.querySelectorAll('table').forEach((table) => {
        const headerRows = table.tHead?.rows;
        if (!headerRows?.length) return;
        // The last header row is the one that lines up with the body cells.
        const names = Array.from(headerRows[headerRows.length - 1].cells).flatMap((cell) =>
          Array<string>(cell.colSpan).fill((cell.dataset.label ?? cell.textContent ?? '').trim()),
        );
        if (!table.dataset.stack) table.dataset.stack = 'rows';
        Array.from(table.tBodies).forEach((body) => {
          Array.from(body.rows).forEach((row) => {
            let column = 0;
            Array.from(row.cells).forEach((cell) => {
              const name = cell.colSpan > 1 ? '' : names[column] ?? '';
              if (cell.dataset.label !== name) cell.dataset.label = name;
              column += cell.colSpan;
            });
          });
        });
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(label);
    };

    label();
    // Only text and elements are watched, so setting the attributes above does not trigger another run.
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

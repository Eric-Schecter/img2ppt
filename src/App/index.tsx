import React, { useState } from 'react';
import styles from './index.module.scss';
import { Presentation, Slide, Image, render } from "react-pptx";

export const App = () => {
  const [isOver, setIsOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const drop = (e: React.DragEvent) => {
    if (isLocked) { return; }
    setIsLocked(true);
    e.stopPropagation();
    e.preventDefault();
    const items = Array.from(e.dataTransfer.items || []);
    if (items.length) {
      const handleFile = (entry: any): Promise<string> => {
        return new Promise((resolve, reject) => {
          entry.file((file: any) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onloadend = (() => resolve(fileReader.result as string))
          })
        })
      }
      const files = items
        .map(item => item.webkitGetAsEntry())
        //todo filter image files
        .map((entry: any): Promise<string> => {
          console.log(entry)
          if (entry.isFile) {
            return handleFile(entry);
          } else {
            //todo for directory
            return new Promise(resolve => resolve(''));
          }
        })

      const download = (data: string, name: string) => {
        const a = document.createElement('a');
        a.href = data;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      Promise.all(files).then(data => {
        render(
          <Presentation>
            {data.map((d, i) =>
              <Slide key={i}>
                <Image
                  style={{
                    x: "0%", y: "0%", w: "100%", h: "100%"
                  }}
                  src={{
                    kind: "data",
                    data: d
                  }} />
              </Slide>)}
          </Presentation>
        )
          .then(buffer => buffer.toString('base64'))
          .then(str => 'data:ms-powerpoint;base64,' + str)
          .then(str => download(str, 'file.pptx'))
          .catch(error => console.log(error))
          .finally(() => setIsLocked(false))
      })

    }
    setIsOver(false);
  }

  const dragover = (e: React.DragEvent) => {
    if (isLocked) { return; }
    e.preventDefault();
    setIsOver(true);
  }

  return <div
    className={`${styles.root} ${isOver ? styles.over : ''}`}
    onDrop={drop}
    onDragOver={dragover}
    onMouseLeave={() => setIsOver(false)}
  >
    <div className={styles.text}>拖拽图片到这</div>
  </div>
}
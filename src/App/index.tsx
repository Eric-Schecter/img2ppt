import React, { useRef, useState } from 'react';
import styles from './index.module.scss';
import { Presentation, Slide, Image, render } from "react-pptx";
import { Video } from './video';


const isVideo = (name: string) => {
  return name.endsWith('.mp4');
}

export const App = () => {
  const [isOver, setIsOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const videoRef = useRef(new Video());

  const handle = (files: Promise<string[]>[]) => {
    const download = (data: string, name: string) => {
      const a = document.createElement('a');
      a.href = data;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    Promise.all(files)
      .then(res => res.reduce((pre, curr) => pre.concat(curr), []))
      .then(data => {
        render(
          <Presentation>
            {data.map((d, i) =>
              <Slide key={i}>
                <Image
                  style={{
                    x: "0%", y: "0%", w: "100%", h: "100%",
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
  const drop = (e: React.DragEvent) => {
    if (isLocked) { return; }
    setIsLocked(true);
    e.stopPropagation();
    e.preventDefault();

    const items = Array.from(e.dataTransfer.items || []);
    if (items.length) {
      const handleVideo = (fileReader: FileReader, resolve: any, reject: any) => {
        videoRef.current.generate(fileReader.result as string)
          .then(res => {
            const mark = 'base64,';
            const index = res.indexOf(mark) + mark.length;
            const paths = res.map(d => d.slice(index))
            resolve(paths);
          })
          .catch(error => {
            console.log(error);
            reject('');
          })
      }
      const handleFile = (entry: any): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          entry.file((file: any) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onloadend = (() => {
              if (isVideo(entry.name)) {
                handleVideo(fileReader, resolve, reject);
              } else {
                resolve([fileReader.result as string])
              }

            })
          })
        })
      }
      const files = items
        .map(item => item.webkitGetAsEntry())
        //todo filter image files
        .map((entry: any): Promise<string[]> => {
          if (entry.isFile) {
            return handleFile(entry);
          } else {
            //todo for directory
            return new Promise(resolve => resolve(['']));
          }
        })

      handle(files);

    }
    setIsOver(false);
  }

  const dragover = (e: React.DragEvent) => {
    if (isLocked) { return; }
    e.preventDefault();
    setIsOver(true);
  }

  const ref = useRef<HTMLInputElement>(null);
  const click = () => {
    if (isLocked) { return; }
    ref.current?.click();
  }

  const changedFiles = () => {
    if (!ref.current) {
      return;
    }
    const { files: items } = ref.current;
    if (!items) {
      return;
    }
    setIsLocked(true);
    const handleFile = (entry: any): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(entry);
        fileReader.onloadend = (() => {
          resolve([fileReader.result as string])
        })
      })
    }
    const files = Array.from(items)
      .map((entry: File): Promise<string[]> => {
        return handleFile(entry);
      })

    handle(files);
  }

  return <div
    className={`${styles.root} ${isOver ? styles.over : ''}`}
    onDrop={drop}
    onDragOver={dragover}
    onClick={click}
    onMouseLeave={() => setIsOver(false)}
  >
    <div className={styles.text}>点击或拖拽图片到此</div>
    <input
      ref={ref}
      name='input'
      style={{ display: 'none' }}
      type='file'
      multiple
      accept="image/*"
      onChange={changedFiles}
    />
  </div>
}
import { UploadCloud, FileText, ImageIcon, X } from "lucide-react";
import style from "./inputUi.module.css";

export default function UploadUI({
  children,
  handleFileChange,
  removeFile,
  file,
  preview,
  inputRef,
}) {
  return (
    <div className={style.uploadWrapper}>
      <div
        className={style.uploadArea + (file ? ` ${style.active}` : "")}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className={style.uploadInput}
          onChange={handleFileChange}
        />
        {children}

        {!file ? (
          <div className={style.uploadEmpty}>
            <div className={style.uploadIconBox}>
              <UploadCloud />
            </div>

            <h3 className={style.uploadTitle}>
              Click to upload or drag and drop
            </h3>

            <p className={style.uploadSubtitle}>
              SVG, PNG, JPG or GIF (max. 800×400px)
            </p>
          </div>
        ) : (
          <div className={style.uploadContent}>
            <div className={style.uploadPreview}>
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className={style.uploadFilePreview}>
                  <FileText />
                  <span>Pré-visualização indisponível</span>
                </div>
              )}
            </div>

            <div className={style.uploadFooter}>
              <div className={style.uploadFileInfo}>
                <p className={style.uploadFileName}>{file.name}</p>

                <p className={style.uploadFileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                className={style.uploadRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";

const AVATAR_STORAGE_KEY = "isra-account-avatar-local";

export default function AvatarUploadClient() {
  const [source, setSource] = useState("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("No file selected");
  const [zoom, setZoom] = useState(1.15);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const [status, setStatus] = useState("Avatar is saved in this browser localStorage only.");

  useEffect(() => {
    const saved = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (saved) {
      setSource(saved);
      setPreview(saved);
      setFileName("Saved local avatar");
      setEditing(false);
    }
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file.");
      return;
    }

    if (file.size > 1024 * 1024 * 2) {
      setStatus("Image too large for localStorage. Please upload under 2MB.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setSource(dataUrl);
      setPreview(dataUrl);
      setZoom(1.15);
      setPosition({ x: 0, y: 0 });
      setEditing(true);
      setStatus("Drag the image to position it, adjust zoom, then Save Cropped Avatar.");
    };

    reader.readAsDataURL(file);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!source || !editing) return;
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      posX: position.x,
      posY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragging || !editing) return;
    setPosition({
      x: dragStart.current.posX + event.clientX - dragStart.current.x,
      y: dragStart.current.posY + event.clientY - dragStart.current.y,
    });
  }

  function endDrag() {
    setDragging(false);
  }

  function saveAvatar() {
    if (!source) {
      setStatus("Upload an image first.");
      return;
    }

    const img = new Image();
    img.onload = () => {
      const size = 512;
      const previewSize = 220;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setStatus("Crop failed: canvas not supported.");
        return;
      }

      const baseScale = Math.max(previewSize / img.width, previewSize / img.height);
      const renderedWidth = img.width * baseScale * zoom;
      const renderedHeight = img.height * baseScale * zoom;
      const renderedX = (previewSize - renderedWidth) / 2 + position.x;
      const renderedY = (previewSize - renderedHeight) / 2 + position.y;
      const scaleToCanvas = size / previewSize;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        img,
        renderedX * scaleToCanvas,
        renderedY * scaleToCanvas,
        renderedWidth * scaleToCanvas,
        renderedHeight * scaleToCanvas
      );
      ctx.restore();

      const cropped = canvas.toDataURL("image/png", 0.92);
      window.localStorage.setItem(AVATAR_STORAGE_KEY, cropped);
      window.dispatchEvent(new CustomEvent("isra-avatar-updated", { detail: cropped }));
      setSource(cropped);
      setPreview(cropped);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setEditing(false);
      setStatus("Saved. Crop editor closed. Account avatar updated locally.");
    };

    img.src = source;
  }

  function removeAvatar() {
    window.localStorage.removeItem(AVATAR_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("isra-avatar-updated", { detail: "" }));
    setSource("");
    setPreview("");
    setFileName("No file selected");
    setZoom(1.15);
    setPosition({ x: 0, y: 0 });
    setEditing(false);
    setStatus("Local avatar removed.");
  }

  return (
    <div className={"account-avatar-uploader account-avatar-uploader-manual " + (!editing ? "account-avatar-saved-mode" : "")}>
      <div className="account-avatar-crop-stage">
        <div
          className={"account-avatar-manual-crop " + (dragging ? "is-dragging" : "") + (!editing ? " is-saved" : "")}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Avatar crop preview"
              draggable={false}
              style={{
                transform: editing ? `translate(${position.x}px, ${position.y}px) scale(${zoom})` : "none",
              }}
            />
          ) : (
            <span>RT</span>
          )}
          {editing && <div className="account-avatar-crop-mask" />}
        </div>

        {editing && (
          <>
            <label className="account-crop-control">
              <span>Zoom</span>
              <input
                type="range"
                min="1"
                max="2.4"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
            <p className="account-crop-hint">Drag photo to choose any part, like Facebook profile crop.</p>
          </>
        )}
      </div>

      <div className="account-avatar-upload-copy">
        <h3>Profile Photo</h3>
        <p>This saves to localStorage only. Permanent save needs backend upload and database avatarUrl binding.</p>

        <div className="account-avatar-actions account-avatar-actions-final">
          <label className="account-upload-button">
            Upload Avatar
            <input type="file" accept="image/*" onChange={onFileChange} />
          </label>

          {editing && (
            <button type="button" className="account-theme-button" onClick={saveAvatar}>
              Save Cropped Avatar
            </button>
          )}

          <button type="button" className="account-avatar-remove" onClick={removeAvatar}>
            Remove
          </button>
        </div>

        <small>{fileName}</small>
        <small>{status}</small>
      </div>
    </div>
  );
}

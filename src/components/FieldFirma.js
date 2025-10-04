'use client';

import { useState, useEffect, useRef } from 'react';
import { validateFirma } from '../lib/validation';
import ValidationHint from './ValidationHint';

export default function FieldFirma({
  paso,
  value,
  onChange,
  disabled = false
}) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;
    
    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    contextRef.current = context;
    
    // If we already have a signature value, draw it
    if (value) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width / 2, canvas.height / 2);
      };
      image.src = value;
    } else {
      // Clear canvas with white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
    }
  }, []);

  useEffect(() => {
    // Validate on mount and when value changes
    if (paso) {
      setValidation(validateFirma(value));
    }
  }, [value, paso]);

  const startDrawing = ({ nativeEvent }) => {
    if (disabled) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Save the signature as a data URL
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    onChange(dataURL);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
    onChange(null);
  };

  return (
    <div className="mb-4">
      <div className={`
        border rounded
        ${!validation.isValid ? 'border-red-500' : 'border-gray-300'}
      `}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          onMouseMove={draw}
          className="w-full h-36 cursor-crosshair bg-white"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {disabled ? 'Firma registrada' : 'Firme en el recuadro superior'}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-red-600 hover:underline"
          >
            Borrar firma
          </button>
        )}
      </div>
      <ValidationHint errors={validation.errors} />
    </div>
  );
}

'use client';

/**
 * Component for showing validation errors/hints
 */
export default function ValidationHint({ errors, className = '' }) {
  if (!errors || errors.length === 0) {
    return null;
  }
  
  return (
    <div className={`text-red-600 text-xs mt-1 ${className}`}>
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  );
}

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { skiaAvailable, Canvas, Skia, SkiaPath } from '@/components/GlowOrb';

function buildPatternPath(width: number, height: number, tileSize: number) {
  if (!Skia) return null;
  const path = Skia.Path.Make();
  const c = tileSize / 3;
  const cols = Math.ceil(width / tileSize) + 1;
  const rows = Math.ceil(height / tileSize) + 1;

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const tx = col * tileSize;
      const ty = row * tileSize;

      // Octagon outline
      path.moveTo(tx + c, ty);
      path.lineTo(tx + 2 * c, ty);
      path.lineTo(tx + tileSize, ty + c);
      path.lineTo(tx + tileSize, ty + 2 * c);
      path.lineTo(tx + 2 * c, ty + tileSize);
      path.lineTo(tx + c, ty + tileSize);
      path.lineTo(tx, ty + 2 * c);
      path.lineTo(tx, ty + c);
      path.close();

      // Inner star lines
      path.moveTo(tx + c, ty);
      path.lineTo(tx + tileSize, ty + 2 * c);
      path.moveTo(tx + 2 * c, ty);
      path.lineTo(tx, ty + 2 * c);
      path.moveTo(tx, ty + c);
      path.lineTo(tx + 2 * c, ty + tileSize);
      path.moveTo(tx + c, ty + tileSize);
      path.lineTo(tx + tileSize, ty + c);
    }
  }
  return path;
}

interface IslamicPatternProps {
  width: number;
  height: number;
  tileSize?: number;
  color?: string;
  rotation?: number;
}

export default function IslamicPattern({
  width,
  height,
  tileSize = 80,
  color = 'rgba(212, 175, 55, 0.08)',
  rotation = 15,
}: IslamicPatternProps) {
  if (!skiaAvailable || !SkiaPath) return null;

  // Calculate exact extra needed for rotation (not a blanket %)
  // After rotating a WxH rect by θ, bounding box grows by h*sin(θ) in width and w*sin(θ) in height
  const rad = (Math.abs(rotation) * Math.PI) / 180;
  const sinR = Math.sin(rad);
  const extraW = height * sinR;
  const extraH = width * sinR;
  const patternW = width + extraW;
  const patternH = height + extraH;

  const patternPath = useMemo(
    () => buildPatternPath(patternW, patternH, tileSize),
    [patternW, patternH, tileSize],
  );

  if (!patternPath) return null;

  return (
    <Canvas
      style={{
        position: 'absolute',
        width: patternW,
        height: patternH,
        left: -extraW / 2,
        top: -extraH / 2,
        transform: [{ rotate: `${rotation}deg` }],
      }}
      pointerEvents="none"
    >
      <SkiaPath path={patternPath} color={color} style="stroke" strokeWidth={1} />
    </Canvas>
  );
}

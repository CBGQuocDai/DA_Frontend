'use client';

import React from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { CaptionInput } from './CaptionInput';

/** Ảnh đính kèm trong trình soạn, kèm ô chú thích ngay bên dưới; kéo ảnh để đổi vị trí. */
export const ImageNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes }) => (
  <NodeViewWrapper as="figure" data-chapter-image="" title="Ảnh đính kèm, TTS không đọc">
    {/* Ảnh nằm trên storage với URL ký có hạn nên không qua trình tối ưu ảnh của Next */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={node.attrs.src ?? ''} alt={node.attrs.description} draggable={false} data-drag-handle="" />
    <figcaption data-caption-control="" contentEditable={false}>
      <CaptionInput
        value={node.attrs.caption ?? ''}
        placeholder="Thêm chú thích ảnh (vd: Hình 2.1: Kiến trúc hệ thống)"
        label="Chú thích ảnh"
        onChange={(caption) => updateAttributes({ caption })}
      />
    </figcaption>
  </NodeViewWrapper>
);

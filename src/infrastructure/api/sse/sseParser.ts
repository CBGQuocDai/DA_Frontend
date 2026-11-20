interface SseMessage {
  event: string;
  data: string;
}

/**
 * Tách stream SSE thành từng message. Hàm trả về giữ lại phần dở dang giữa các lần gọi,
 * nên một event bị cắt đôi giữa hai chunk mạng vẫn ra đúng một message.
 */
export const createSseParser = () => {
  let buffer = '';

  return (chunk: string): SseMessage[] => {
    let text = buffer + chunk;
    // "\r" ở cuối chunk có thể là nửa đầu của "\r\n": giữ lại để không tính thành hai lần xuống dòng
    const carry = text.endsWith('\r') ? '\r' : '';
    if (carry) text = text.slice(0, -1);
    const blocks = text.replace(/\r\n?/g, '\n').split('\n\n');
    // Khối cuối chưa gặp dòng trống kết thúc nên để lại cho lần sau
    buffer = (blocks.pop() ?? '') + carry;

    const messages: SseMessage[] = [];
    for (const block of blocks) {
      let event = 'message';
      const data: string[] = [];
      for (const line of block.split('\n')) {
        // Dòng bắt đầu bằng ":" là comment (heartbeat)
        if (!line || line.startsWith(':')) continue;
        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '');
        if (field === 'event') event = value;
        else if (field === 'data') data.push(value);
      }
      if (data.length > 0) messages.push({ event, data: data.join('\n') });
    }
    return messages;
  };
};

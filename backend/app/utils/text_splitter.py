class RecursiveTextSplitter:
    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        separators: list[str] | None = None,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", ". ", " "]

    def split_text(self, text: str) -> list[str]:
        chunks = []
        self._split_recursive(text, self.separators, chunks)
        return chunks

    def _split_recursive(self, text: str, separators: list[str], chunks: list[str]):
        if len(text) <= self.chunk_size:
            text = text.strip()
            if text:
                chunks.append(text)
            return

        # Find the best separator
        separator = separators[0] if separators else ""
        for sep in separators:
            if sep in text:
                separator = sep
                break

        parts = text.split(separator)
        current_chunk = ""

        for part in parts:
            candidate = (current_chunk + separator + part).strip() if current_chunk else part.strip()

            if len(candidate) <= self.chunk_size:
                current_chunk = candidate
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                    # Keep overlap
                    overlap_text = current_chunk[-self.chunk_overlap:] if self.chunk_overlap else ""
                    current_chunk = (overlap_text + " " + part).strip() if overlap_text else part.strip()
                else:
                    # Part itself is too long, try next separator
                    if len(separators) > 1:
                        self._split_recursive(part, separators[1:], chunks)
                        current_chunk = ""
                    else:
                        # Force split
                        for i in range(0, len(part), self.chunk_size - self.chunk_overlap):
                            chunk = part[i:i + self.chunk_size].strip()
                            if chunk:
                                chunks.append(chunk)
                        current_chunk = ""

        if current_chunk:
            chunks.append(current_chunk)

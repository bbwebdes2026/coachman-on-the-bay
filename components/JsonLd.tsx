/**
 * Renders a typed schema.org object into a JSON-LD <script>. Server component —
 * the object is serialized at render time, never hand-written as a string, so the
 * structured data stays type-checked and maintainable (see data/restaurant.ts).
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

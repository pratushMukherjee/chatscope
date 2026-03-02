const models = [
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Most capable' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'Fast & efficient' },
];

export default function ModelSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}

'use client';

type Section = {
  id: string;
  title: string;
  slug: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
};

type Props = {
  sections: Section[];
  onToggle: (section: Section) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function HomepageSectionTable({
  sections,
  onToggle,
  onDelete,
}: Props) {
  if (sections.length === 0) {
    return (
      <div className='rounded-3xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700'>
        No homepage sections found
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <table className='w-full'>
        <thead className='bg-zinc-50 dark:bg-zinc-950'>
          <tr>
            <th className='p-4 text-left'>Order</th>
            <th className='p-4 text-left'>Title</th>
            <th className='p-4 text-left'>Type</th>
            <th className='p-4 text-left'>Status</th>
            <th className='p-4 text-right'>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sections.map((section) => (
            <tr
              key={section.id}
              className='border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800'
            >
              <td className='p-4'>{section.sortOrder}</td>

              <td className='p-4 font-medium'>
                {section.title}
                <div className='text-xs text-zinc-500'>
                  {section.slug}
                </div>
              </td>

              <td className='p-4'>{section.type}</td>

              <td className='p-4'>
                <span
                  className={
                    section.enabled
                      ? 'rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }
                >
                  {section.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>

              <td className='space-x-2 p-4 text-right'>
                <button
                  onClick={() => onToggle(section)}
                  className='rounded-xl border border-zinc-200 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                >
                  Toggle
                </button>

                <button
                  onClick={() => onDelete(section.id)}
                  className='rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

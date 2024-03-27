'use client';

import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { compact, uniqBy } from 'lodash';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  prompt: z.string().min(2, {
    message: 'Prompt must be at least 2 characters.',
  }),
});

export default function Home() {
  const runQuery = trpc.run.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      //form.reset();
      toast('Submitted');
      const res = await runQuery.mutateAsync({ prompt: values.prompt });
      console.log('Results', res);
    },
    [runQuery],
  );

  const allSources = runQuery.data
    ? uniqBy(
        compact(
          runQuery.data.table.flatMap(row =>
            row.flatMap(cell => cell?.sources),
          ),
        ),
        'url',
      )
    : [];

  return (
    <main className="min-h-screen space-y-3 p-24">
      <h1 className="text-lg font-bold">Deep Seek</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="prompt"
            disabled={runQuery.isLoading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Query</FormLabel>
                <FormControl>
                  <Input placeholder="Hello world" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-[140px]"
            type="submit"
            disabled={runQuery.isLoading}
          >
            {runQuery.isLoading ? 'Researching...' : 'Submit'}
          </Button>
        </form>
      </Form>

      {runQuery.data && (
        <>
          <hr />
          <div className="w-full divide-y divide-gray-200 overflow-x-scroll">
            <div className="flex w-fit bg-gray-50">
              {runQuery.data.columns.map((column, index) => (
                <div
                  key={index}
                  className="w-[300px] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {column.name}
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-200">
              {runQuery.data.table.map((row, rowIndex) => (
                <div key={rowIndex} className="flex w-fit bg-white">
                  {row.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="w-[300px] overflow-hidden whitespace-break-spaces px-6 py-4 text-sm text-gray-500"
                      style={{
                        backgroundColor:
                          cell && cell.confidence < 1
                            ? '#FFF4E6'
                            : 'transparent',
                      }}
                    >
                      {cell ? (
                        <>
                          <p>{cell.text}</p>
                          <div className="space-x-1">
                            {cell.sources.map((source, sourceIndex) => (
                              <a
                                key={sourceIndex}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500"
                              >
                                [
                                {allSources
                                  .map(s => s.url)
                                  .indexOf(source.url) + 1}
                                ]
                              </a>
                            ))}
                          </div>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <hr />
          <div className="overflow-x-hidden">
            <h2 className="text-lg font-bold">Sources</h2>
            <ul className="list-disc pl-5">
              {allSources.map((source, sourceIndex) => (
                <li key={sourceIndex}>
                  {sourceIndex + 1}.{' '}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}

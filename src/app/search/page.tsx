import { SearchClient } from './SearchClient';

type SearchParams = {
  q?: string | string[];
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const SearchPage = async ({ searchParams }: Props) => {
  const sp = await searchParams;

  const rawQ = sp.q;
  const q =
    typeof rawQ === 'string'
      ? rawQ
      : Array.isArray(rawQ)
        ? (rawQ[0] ?? '')
        : '';

  return <SearchClient q={q} />;
};

export default SearchPage;

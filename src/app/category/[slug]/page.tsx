// src/app/category/[slug]/page.tsx
import CategoryClient from './CategoryClient';

type PageProps = {
  params: {
    slug: string;
  };
};

const CategoryPage = ({ params }: PageProps) => {
  return <CategoryClient slug={params.slug} />;
};

export default CategoryPage;

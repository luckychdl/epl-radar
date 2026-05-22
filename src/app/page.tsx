import MainPage from "./main/page";
interface Props {
  searchParams: {
    date: string;
  };
}
export default async function HomePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <MainPage searchParams={resolvedSearchParams} />;
}

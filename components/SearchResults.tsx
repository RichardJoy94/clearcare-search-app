interface Result {
  id: string;
  name: string;
  category: string;
  price: string;
}

interface SearchResultsProps {
  results: Result[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (!results.length) {
    return <p>No results found.</p>;
  }

  return (
    <ul>
      {results.map((result) => (
        <li key={result.id}>
          <h3>{result.name}</h3>
          <p>Category: {result.category}</p>
          <p>Price: {result.price}</p>
        </li>
      ))}
    </ul>
  );
}

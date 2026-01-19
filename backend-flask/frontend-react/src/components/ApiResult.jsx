export default function ApiResult({ result, error }) {
  if (!result && !error) return null

  if (error) {
    return (
      <div>
        <p className="error">{error.message || 'Request failed'}</p>
        {error.payload ? <pre className="output">{JSON.stringify(error.payload, null, 2)}</pre> : null}
      </div>
    )
  }

  return <pre className="output">{JSON.stringify(result, null, 2)}</pre>
}

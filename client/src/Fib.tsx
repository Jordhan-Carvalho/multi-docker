import React, { useState, useEffect } from "react";
import axios from "axios";

interface Data {
  seenIndexes: any[];
  values: { [key: string]: string };
  index: string;
}

export const Fib = () => {
  const initialData: Data = {
    seenIndexes: [],
    values: {},
    index: "",
  };

  const [state, setState] = useState(initialData);
  useEffect(() => {
    fetchValuesAndIndexes();
  }, []);

  const fetchValuesAndIndexes = async () => {
    const values = await axios.get("/api/values/current");
    const seenIndexes = await axios.get("/api/values/all");

    setState({
      ...state,
      seenIndexes: seenIndexes.data,
      values: values.data,
    });
  };

  const renderSeenIndexes = (): string => {
    return state.seenIndexes.map(({ number }) => number).join(", ");
  };

  const renderValues = (): JSX.Element[] => {
    const entries: JSX.Element[] = [];
    for (let key in state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {state.values[key]}
        </div>
      );
    }
    return entries;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    await axios.post("/api/values", {
      index: state.index,
    });
    setState({ ...state, index: "" });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input
          value={state.index}
          onChange={(event) =>
            setState({ ...state, index: event.target.value })
          }
        />
        <button>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {renderSeenIndexes()}

      <h3>Calculated Values:</h3>
      {renderValues()}
    </div>
  );
};

import { useState, useEffect } from 'react';
import useLoadingEvents from './useLoadingEvents';
import { Events as evUtil } from '../utils';

function useFetchEvents(endpoint, payload) {
  const [fetchedEvents, setFetchedEvents] = useState([]);
  const isLoading = useLoadingEvents(fetchedEvents);

  useEffect(() => {
    fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload,
      }),
    })
      .then(res => res.json())
      .then((resJson) => {
        // stop here if there is no data
        if (!resJson || resJson.length === 0) {
          return;
        }

        // need to add event data into node here
        const filteredData = evUtil.getPreprocessedEvents(
          resJson.map(x => ({ node: x })),
        );

        // add to global state
        setFetchedEvents(filteredData);
      })
      // eslint-disable-next-line
      .catch(err => console.log(err));
  }, [endpoint, payload]);

  return [fetchedEvents, isLoading];
}

export default useFetchEvents;

import { graphql } from 'gatsby';
import React, { useState, useEffect } from 'react';
import EventsContainer from '../components/EventsContainer';
import Layout from '../components/layout';
import useGlobal from '../store';
import useLocalStorage from '../hooks/useLocalStorage';
import useStaticResources from '../hooks/useStaticResources';
import { Events as evUtil } from '../utils';
import useLoadingAllEvents from '../hooks/useLoadingEvents';

export default ({ data, location }) => {
  // use this to retrieve data and rehydrate before globalState is used
  useLocalStorage();
  useStaticResources();
  const [globalState] = useGlobal();

  // local state
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  // get selected event indexes from global state
  const { selectedEvents: selectedEventsIndexes } = globalState;

  useEffect(() => {
    fetch('/api/recommendations', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: selectedEventsIndexes,
      }),
    })
      .then(res => res.json())
      .then((recommendedIndexes) => {
        // stop here if there is no data
        if (!recommendedIndexes || recommendedIndexes.length === 0) {
          return;
        }

        const filteredData = evUtil.getPreprocessedEvents(data.dataJson.data)
          .filter(
            event => recommendedIndexes.find(rec => rec.event_index === event.event_index),
          )
          // recommended events should contain relevance value:
          // {
          //   `...event_data`,
          //   relevance: `relevance_value`
          // }
          .reduce((acc, cur) => ([
            ...acc,
            {
              ...cur,
              relevance: recommendedIndexes.find(
                rec => rec.event_index === cur.event_index,
              ).relevance,
            },
          ]), []);

        // add to global state
        setRecommendedEvents(filteredData);
      })
      // eslint-disable-next-line
      .catch(err => console.log(err));
  }, [data.dataJson.data, selectedEventsIndexes]);

  // use custom hook to check if it is loading
  const isLoading = useLoadingAllEvents(data.dataJson.data);

  return (
    <Layout>
      <h1>Recommendations</h1>
      <EventsContainer
        isLoading={isLoading}
        allEvents={recommendedEvents}
        noEventDefaultText="Add some events to your library to see your recommendations."
      />
    </Layout>
  );
};

export const query = graphql`
  query {
    dataJson {
      modified_date
      data {
        date_dt
        description
        endtime
        event_index
        location
        owner
        speaker
        starttime
        title
        url
      }
    }
  }
`;

import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Datetime as dtutil } from '../../../../utils';
import useGlobal from '../../../../store';

const DatetimeWrapper = styled.div`
  font-size: 2rem;
  align-items: center;
  justify-content: center;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  width: 5.5rem;
  min-width: 5.5rem;
`;

const SubWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const StyledTime = styled.div`
  text-align: center;
  font-size: 1rem;
  display: inline-flex;
`;

const StyledFavIcon = styled(Fa).attrs(() => ({
  icon: 'star',
}))`
  color: ${props => (props.checked ? 'orange' : '#eee')};
  font-size: 1.75rem;
`;

const TimeBox = ({ starttime, endtime, eventIndex }) => {
  const [, globalActions] = useGlobal();
  const [checked, setChecked] = useState(false);

  // destructuring actions to use
  const { toggleSelectedEvent } = globalActions;

  let singleTime = null;
  let plusTime = null;
  if (starttime === endtime) {
    if (!starttime || !endtime) {
      singleTime = '-';
    } else if (starttime.includes('allday')) {
      singleTime = 'All day';
    } else {
      plusTime = dtutil.getAssumedEndtime(endtime);
    }
  }

  return (
    <DatetimeWrapper>
      {
        !singleTime
          ? (
            <React.Fragment>
              <StyledTime>
                {dtutil.getTime(starttime)}
              </StyledTime>
              <StyledTime>
                {plusTime || dtutil.getTime(endtime)}
              </StyledTime>
            </React.Fragment>
          )
          : <StyledTime>{singleTime}</StyledTime>
      }
      <SubWrapper
        onClick={(e) => {
          // set global state
          toggleSelectedEvent(eventIndex);
          // set local state
          setChecked(prev => !prev);
          // block this because if the item has
          // description this will propagate
          // through invoke showing description
          e.stopPropagation();
        }}
      >
        <StyledFavIcon
          checked={checked}
        />
      </SubWrapper>
    </DatetimeWrapper>
  );
};

TimeBox.propTypes = {
  starttime: PropTypes.string,
  endtime: PropTypes.string,
  eventIndex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

TimeBox.defaultProps = {
  starttime: null,
  endtime: null,
  eventIndex: null,
};

export default TimeBox;

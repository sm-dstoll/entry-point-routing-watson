import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import useLocation hook from react-router-dom to access query params
import { useHistory, useLocation } from 'react-router-dom';
import PersonaVideo from '../components/PersonaVideo';
// import Captions from '../components/Captions';
import Controls from '../components/Controls';
import ContentCardDisplay from '../components/ContentCardDisplay';
// import sendTextMessage from the redux store to enable initial message to be sent to Watson. This function will need to be mapped to dispatch at bottom of this file
import {
  disconnect,
  sendTextMessage,
} from '../store/sm/index';
import Header from '../components/Header';
import {
  headerHeight, disconnectPage, disconnectRoute,
} from '../config';
// import CameraPreview from '../components/CameraPreview';
import breakpoints from '../utils/breakpoints';

const DPChat = ({
  className,
  connected,
  disconnected,
  // include dispatchText in props for DPChat component
  dispatchText,
  dispatchDisconnect,
  error,
  tosAccepted,
  cameraOn,
}) => {
  const overlayRef = createRef();
  const [height, setHeight] = useState('100vh');
  const [largeViewport, setLargeViewport] = useState(false);
  const [startedAt] = useState(Date.now());
  // Create a new URLSearchParams object with the result of the useLocation() hook and get the value associated with the parameter name in line 39
  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const entryPoint = query.get('entryPoint');

  const handleResize = () => {
    setHeight(window.innerHeight);
    if (window.innerWidth >= breakpoints.md) setLargeViewport(true);
    else setLargeViewport(false);
  };

  const cleanup = () => {
    if (Date.now() - startedAt < 1000) {
      console.warn('cleanup function invoked less than 1 second after component mounted, ignoring!');
    } else {
      console.log('cleanup function invoked!');
      window.removeEventListener('resize', handleResize);
      dispatchDisconnect();
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    // switch statement to send the initial message to Watson via the dispatchText function
    switch (entryPoint) {
      case 'creditcard':
        dispatchText('creditcard');
        break;
      case 'mortgage':
        dispatchText('mortgage');
        break;
      case 'banking':
        dispatchText('banking');
        break;
      default:
        dispatchText('hi');
    }
    // run cleanup on unmount
    return () => cleanup();
  }, []);

  window.onbeforeunload = () => {
    console.log('cleaning up');
    cleanup();
  };

  const history = useHistory();
  useEffect(() => {
    if (error !== null) history.push('/loading?error=true');
  }, [error]);
  // if TOS hasn't been accepted, send to /
  if (tosAccepted === false && disconnected === false) {
    cleanup();
    history.push('/');
  }
  if (disconnected === true) {
    if (disconnectPage) {
      history.push(disconnectRoute);
    } else history.push('/');
  }

  return (
    <div className={className}>
      <div className="video-overlay" ref={overlayRef} style={{ height }}>
        <Header />
        {/* top row */}
        <div className="container d-flex flex-column">
          {
              cameraOn
                ? (
                  <div className="row d-flex justify-content-end">
                    <div className="col-auto">
                      <div className="camera-preview">
                        {/* <CameraPreview /> */}
                      </div>
                    </div>
                  </div>
                )
                : <div />
            }
          {/* middle row */}
          <div className="vertical-fit-container col-md-5" style={{ width: '800px' }}>
            {/* on larger devices, show cards next to DP */}
            <div className="d-md-block d-none">
              {largeViewport === true ? <ContentCardDisplay /> : null}
            </div>
          </div>
          {/* bottom row */}
          <div>
            {/* on smaller devices, show the cards over the DP, centered */}
            <div className="row">
              <div className="d-block d-md-none">
                {largeViewport === false ? <ContentCardDisplay /> : null}
              </div>
            </div>
            {/* <div className="row">
              <div className="col text-center">
                <Captions />
              </div>
            </div> */}
            <div className="row">
              <div className="col">
                <Controls />
              </div>
            </div>
          </div>
        </div>
      </div>
      {
      connected ? <PersonaVideo /> : null
    }
    </div>
  );
};

// add dispatchText as a required function to propTypes
DPChat.propTypes = {
  className: PropTypes.string.isRequired,
  dispatchDisconnect: PropTypes.func.isRequired,
  dispatchText: PropTypes.func.isRequired,
  connected: PropTypes.bool.isRequired,
  disconnected: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    msg: PropTypes.string,
    err: PropTypes.objectOf(PropTypes.string),
  }),
  tosAccepted: PropTypes.bool.isRequired,
  cameraOn: PropTypes.bool.isRequired,
};

DPChat.defaultProps = {
  error: null,
};

const StyledDPChat = styled(DPChat)`
  .video-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;

    width: 100%;

    .container {
      height: calc(100% - ${headerHeight});
    }

    .vertical-fit-container {
      flex: 1 1 auto;
      overflow-y: scroll;

      scrollbar-width: none; /* Firefox 64 */
      &::-webkit-scrollbar {
        display: none;
      }

      @media (min-width: ${breakpoints.md}px) {
        display: flex;
        align-items: center;
      }
    }
    .loading-container {
      flex: 1 1 auto;
      text-align: center;
    }

  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  disconnected: sm.disconnected,
  loading: sm.loading,
  error: sm.error,
  tosAccepted: sm.tosAccepted,
  cameraOn: sm.cameraOn,
});

// Add dispatchText to mapDispatchToProps to ensure the function works as expected
const mapDispatchToProps = (dispatch) => ({
  dispatchDisconnect: () => dispatch(disconnect()),
  dispatchText: (text) => dispatch(sendTextMessage({ text })),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledDPChat);

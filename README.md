# Entry point routing for Custom UI

Using Soul Machines custom UI framework, it is possible to programmatically update the initial message sent by the Digital Person based on a query string on the URL. The files contained in this repo originally appear in the `src/routes` directory of the custom UI template.

When launching the digital person, the `Landing` component is first shown to the user where they are able to accept the Privacy Notice and EULA. To enable this process, the URL will need to be appended with a query string, ex: `www.yourwebsite.com/?entryPoint=mortgage`. 
Please see comments on the following lines of the `Landing.js` file:
* 11
* 20
* 92

After clicking on the `I accept Privacy Notice and EULA` button, the web page will render the `Loading` component with the original query string appended to its route. We will essentially repeat the process of retrieving and passing along the query string value to the `Proceed` button in order to render the Digital Person with the query param in place. 
Please see comments on the following lines of the `Loading.js` file:
* 4
* 24
* 56

After clicking on the `Proceed` button, the DPChat component renders the Digital Person experience with the query string in place. We are then able to use a `useEffect` hook from React to dispatch the correct initial message to Watson based on the value of the query param. To simplify the retrival of this parameter value, we use the [`URLSearchParams` Javascript interface](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) to isolate the value and pass it to our `useEffect` hook, which contains a switch statement to send the initial message. Please note that the `dispatchText` function will need to be added to the `mapDispatchToState` function at the bottom of the file.
Please see comments on the following lines of the `DPChat.js` file:
* 5
* 11
* 27
* 36
* 60
* 154
* 218

Please note that this demo implementation is based on our provided custom UI framework. There may be some slight differences to your own implementation, however the general steps should remain consistent.

In Watson, you will need to ensure each inital message generated using this method is mapped to a corresponding node in dialog management.

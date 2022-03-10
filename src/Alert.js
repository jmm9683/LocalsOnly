import React, { useState } from "react";

function Alert({
  alertLocationFlag,
  alertFollowingSuccessFLag,
  alertFollowingFailFLag,
}) {
  const [alertLocation, setAlertLocation] = useState(alertLocationFlag);
  const [alertFollowingSuccess, setAlertFollowingSuccess] = useState(
    alertFollowingSuccessFLag
  );
  const [alertFollowingFail, setAlertFollowingFail] = useState(
    alertFollowingFailFLag
  );

  return (
    <div>
      {alertLocation && !alertFollowingSuccess && !alertFollowingFail && (
        <div
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong class="font-bold">Location Blocked! </strong>
          <span class="block sm:inline">
            Please Enable Access to Your Location
          </span>
        </div>
      )}
      {!alertLocation && alertFollowingSuccess && !alertFollowingFail && (
        <div
          class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong class="font-bold">New Local Added! </strong>
          <span class="block sm:inline"></span>
        </div>
      )}
      {!alertLocation && !alertFollowingSuccess && alertFollowingFail && (
        <div
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong class="font-bold">Following Link No Longer Exists</strong>
          <span class="block sm:inline"></span>
        </div>
      )}
    </div>
  );
}

export default Alert;

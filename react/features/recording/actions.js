// @flow

import JitsiMeetJS, { JitsiRecordingConstants } from '../base/lib-jitsi-meet';
import {
    hideNotification,
    showErrorNotification,
    showNotification
} from '../notifications';

import {
    CLEAR_RECORDING_SESSIONS,
    RECORDING_SESSION_UPDATED,
    SET_PENDING_RECORDING_NOTIFICATION_UID,
    SET_STREAM_KEY
} from './actionTypes';

/**
 * Clears the data of every recording sessions.
 *
 * @returns {{
 *     type: CLEAR_RECORDING_SESSIONS
 * }}
 */
export function clearRecordingSessions() {
    return {
        type: CLEAR_RECORDING_SESSIONS
    };
}

/**
 * Signals that the pending recording notification should be removed from the
 * screen.
 *
 * @param {string} streamType - The type of the stream (e.g. file or stream).
 * @returns {Function}
 */
export function hidePendingRecordingNotification(streamType: string) {
    return (dispatch: Function, getState: Function) => {
        const { pendingNotificationUids } = getState()['features/recording'];
        const pendingNotificationUid = pendingNotificationUids[streamType];

        if (pendingNotificationUid) {
            dispatch(hideNotification(pendingNotificationUid));
            dispatch(
                _setPendingRecordingNotificationUid(
                    undefined, streamType));
        }
    };
}

/**
 * Sets the stream key last used by the user for later reuse.
 *
 * @param {string} streamKey - The stream key to set.
 * redux.
 * @returns {{
 *     type: SET_STREAM_KEY,
 *     streamKey: string
 * }}
 */
export function setLiveStreamKey(streamKey: string) {
    return {
        type: SET_STREAM_KEY,
        streamKey
    };
}

/**
 * Signals that the pending recording notification should be shown on the
 * screen.
 *
 * @param {string} streamType - The type of the stream (e.g. file or stream).
 * @returns {Function}
 */
export function showPendingRecordingNotification(streamType: string) {
    return (dispatch: Function) => {
        const isLiveStreaming
            = streamType === JitsiMeetJS.constants.recording.mode.STREAM;
        const dialogProps = isLiveStreaming ? {
            descriptionKey: 'liveStreaming.pending',
            titleKey: 'dialog.liveStreaming'
        } : {
            descriptionKey: 'recording.pending',
            titleKey: 'dialog.recording'
        };
        const showNotificationAction = showNotification({
            isDismissAllowed: false,
            ...dialogProps
        });

        dispatch(showNotificationAction);

        dispatch(_setPendingRecordingNotificationUid(
            showNotificationAction.uid, streamType));
    };
}

/**
 * Signals that the recording error notification should be shown.
 *
 * @param {Object} props - The Props needed to render the notification.
 * @returns {showErrorNotification}
 */
export function showRecordingError(props: Object) {
    return showErrorNotification(props);
}

/**
 * Signals that the stopped recording notification should be shown on the
 * screen for a given period.
 *
 * @param {string} streamType - The type of the stream (e.g. file or stream).
 * @returns {showNotification}
 */
export function showStoppedRecordingNotification(streamType: string) {
    const isLiveStreaming
        = streamType === JitsiMeetJS.constants.recording.mode.STREAM;
    const dialogProps = isLiveStreaming ? {
        descriptionKey: 'liveStreaming.off',
        titleKey: 'dialog.liveStreaming'
    } : {
        descriptionKey: 'recording.off',
        titleKey: 'dialog.recording'
    };

    return showNotification(dialogProps, 2500);
}

/**
 * Updates the known state for a given recording session.
 *
 * @param {Object} session - The new state to merge with the existing state in
 * redux.
 * @returns {{
 *     type: RECORDING_SESSION_UPDATED,
 *     sessionData: Object
 * }}
 */
export function updateRecordingSessionData(session: Object) {
    const status = session.getStatus();
    const timestamp
        = status === JitsiRecordingConstants.status.ON
            ? Date.now() / 1000
            : undefined;

    return {
        type: RECORDING_SESSION_UPDATED,
        sessionData: {
            error: session.getError(),
            id: session.getID(),
            liveStreamViewURL: session.getLiveStreamViewURL(),
            mode: session.getMode(),
            status,
            timestamp
        }
    };
}

/**
 * Sets UID of the the pending streaming notification to use it when hinding
 * the notification is necessary, or unsets it when undefined (or no param) is
 * passed.
 *
 * @param {?number} uid - The UID of the notification.
 * redux.
 * @param {string} streamType - The type of the stream (e.g. file or stream).
 * @returns {{
 *     type: SET_PENDING_RECORDING_NOTIFICATION_UID,
 *     streamType: string,
 *     uid: number
 * }}
 */
function _setPendingRecordingNotificationUid(uid: ?number, streamType: string) {
    return {
        type: SET_PENDING_RECORDING_NOTIFICATION_UID,
        streamType,
        uid
    };
}

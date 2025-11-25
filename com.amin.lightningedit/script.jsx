var historyStack = [];

function captureTrackState(track) {
    var state = [];
    for (var i = 0; i < track.clips.numItems; i++) {
        var clip = track.clips[i];
        state.push({
            projectItem: clip.projectItem,
            start: clip.start.seconds,
            end: clip.end.seconds,
            inPoint: clip.inPoint.seconds,
            outPoint: clip.outPoint.seconds
        });
    }
    return state;
}

function restoreTrackState(track, state) {
    // Clear Track
    var clips = [];
    for (var i = 0; i < track.clips.numItems; i++) clips.push(track.clips[i]);
    for (var j = 0; j < clips.length; j++) clips[j].remove(false, false);

    // Restore Clips
    for (var k = 0; k < state.length; k++) {
        var item = state[k];
        var time = new Time();
        time.seconds = item.start;

        track.overwriteClip(item.projectItem, time);

        // Adjust Duration/In/Out
        // Finding the just-added clip can be tricky, assuming it's the one at 'time'
        for (var m = 0; m < track.clips.numItems; m++) {
            var clip = track.clips[m];
            if (Math.abs(clip.start.seconds - item.start) < 0.01) {
                var newEnd = new Time();
                newEnd.seconds = item.end;
                clip.end = newEnd;

                var newIn = new Time();
                newIn.seconds = item.inPoint;
                clip.inPoint = newIn;

                var newOut = new Time();
                newOut.seconds = item.outPoint;
                clip.outPoint = newOut;
                break;
            }
        }
    }
}

function rebuildAndSync() {
    var project = app.project;
    var sequence = project.activeSequence;
    if (!sequence) { alert("Please open a sequence."); return; }

    var audioTrack = sequence.audioTracks[0];
    var videoTrack = null;
    var trackIndex = -1;

    // Find the video track with selected clips
    for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
        var track = sequence.videoTracks[i];
        for (var j = 0; j < track.clips.numItems; j++) {
            if (track.clips[j].isSelected()) {
                videoTrack = track;
                trackIndex = i;
                break;
            }
        }
        if (videoTrack) break;
    }

    if (!videoTrack) {
        alert("Please select the images/clips you want to sync.");
        return;
    }

    try {
        // Capture State for Undo
        var currentState = captureTrackState(videoTrack);

        // Push to History Stack
        historyStack.push({
            trackIndex: trackIndex,
            state: currentState
        });

        // Harvest Clips
        var videoClips = [];
        for (var i = 0; i < videoTrack.clips.numItems; i++) {
            if (videoTrack.clips[i].isSelected()) {
                videoClips.push(videoTrack.clips[i]);
            }
        }

        videoClips = []; // Resetting to be sure
        for (var i = 0; i < videoTrack.clips.numItems; i++) videoClips.push(videoTrack.clips[i]);

        videoClips.sort(function (a, b) { return a.start.seconds - b.start.seconds; });

        var sourceImages = [];
        for (var j = 0; j < videoClips.length; j++) { sourceImages.push(videoClips[j].projectItem); }

        var audioClips = [];
        for (var k = 0; k < audioTrack.clips.numItems; k++) audioClips.push(audioTrack.clips[k]);
        audioClips.sort(function (a, b) { return a.start.seconds - b.start.seconds; });

        if (sourceImages.length === 0 || audioClips.length === 0) {
            alert("Error: Ensure Images are on the selected track and Audio is on A1.");
            return;
        }

        // Clear Target Track
        for (var x = 0; x < videoClips.length; x++) videoClips[x].remove(false, false);

        // Replant
        var loopCount = Math.min(sourceImages.length, audioClips.length);
        for (var z = 0; z < loopCount; z++) {
            var sourceItem = sourceImages[z];
            var audioClip = audioClips[z];
            var placeTime = new Time();
            placeTime.seconds = audioClip.start.seconds;

            videoTrack.overwriteClip(sourceItem, placeTime);

            // Find and Stretch (Tolerance 0.1s)
            for (var m = 0; m < videoTrack.clips.numItems; m++) {
                if (Math.abs(videoTrack.clips[m].start.seconds - placeTime.seconds) < 0.1) {
                    var newEnd = new Time();
                    newEnd.seconds = audioClip.end.seconds;
                    videoTrack.clips[m].end = newEnd;
                    break;
                }
            }
        }
    } catch (e) {
        alert("Error: " + e.toString());
    }
}

function blurify() {
    app.enableQE();
    var project = app.project;
    var sequence = project.activeSequence;
    if (!sequence) { alert("Please open a sequence."); return; }

    var videoTrack = null;
    var trackIndex = -1;

    // Find the video track with selected clips
    for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
        var track = sequence.videoTracks[i];
        for (var j = 0; j < track.clips.numItems; j++) {
            if (track.clips[j].isSelected()) {
                videoTrack = track;
                trackIndex = i;
                break;
            }
        }
        if (videoTrack) break;
    }

    if (!videoTrack) {
        alert("Please select the clips you want to Blurify.");
        return;
    }

    // Ensure there is a track BELOW
    if (trackIndex === 0) {
        alert("Blurify Error: Selected clips are on V1. Please move them to V2 or higher so the background can be placed on the track below.");
        return;
    }
    var lowerTrack = sequence.videoTracks[trackIndex - 1];

    try {
        // Capture State of LOWER track for Undo (since we are modifying it)
        var currentState = captureTrackState(lowerTrack);
        historyStack.push({
            trackIndex: trackIndex - 1,
            state: currentState
        });

        // Get Selected Clips from Original Track
        var selectedClips = [];
        for (var k = 0; k < videoTrack.clips.numItems; k++) {
            if (videoTrack.clips[k].isSelected()) {
                selectedClips.push(videoTrack.clips[k]);
            }
        }

        // Process each clip
        for (var m = 0; m < selectedClips.length; m++) {
            var clip = selectedClips[m];

            // 1. Copy to Lower Track (Background Version)
            var newClipStart = new Time();
            newClipStart.seconds = clip.start.seconds;
            lowerTrack.overwriteClip(clip.projectItem, newClipStart);

            // Find the new clip on the lower track
            var backgroundClip = null;
            for (var u = 0; u < lowerTrack.clips.numItems; u++) {
                var uClip = lowerTrack.clips[u];
                if (Math.abs(uClip.start.seconds - newClipStart.seconds) < 0.01) {
                    backgroundClip = uClip;

                    // Match In/Out/Duration
                    var newIn = new Time(); newIn.seconds = clip.inPoint.seconds;
                    uClip.inPoint = newIn;

                    var newEnd = new Time(); newEnd.seconds = clip.end.seconds;
                    uClip.end = newEnd;
                    break;
                }
            }

            if (!backgroundClip) continue;

            // 2. Blur and Scale Background Clip
            // Calculate Scale to Fill
            var seqWidth = sequence.frameSizeHorizontal;
            var seqHeight = sequence.frameSizeVertical;

            var clipWidth = 0;
            var clipHeight = 0;

            if (clip.projectItem) {
                var metadata = clip.projectItem.getProjectMetadata();
                if (metadata) {
                    var patterns = [
                        /<kpremiere:Column.IntrinsicVideoInfo>(.*?)<\/kpremiere:Column.IntrinsicVideoInfo>/,
                        /tiff:ImageWidth="(\d+)"/,
                        /exif:PixelXDimension="(\d+)"/,
                        /xmpDM:videoFrameSize w="(\d+)" h="(\d+)"/
                    ];

                    for (var p = 0; p < patterns.length; p++) {
                        var match = metadata.match(patterns[p]);
                        if (match) {
                            if (match.length >= 3) {
                                clipWidth = parseInt(match[1]);
                                clipHeight = parseInt(match[2]);
                            } else if (match[1].indexOf("x") !== -1) {
                                var dims = match[1].match(/(\d+)\s*x\s*(\d+)/);
                                if (dims) {
                                    clipWidth = parseInt(dims[1]);
                                    clipHeight = parseInt(dims[2]);
                                }
                            } else {
                                clipWidth = parseInt(match[1]);
                                var hMatch = metadata.match(/tiff:ImageLength="(\d+)"/) || metadata.match(/exif:PixelYDimension="(\d+)"/);
                                if (hMatch) clipHeight = parseInt(hMatch[1]);
                            }

                            if (clipWidth > 0 && clipHeight > 0) break;
                        }
                    }
                }
            }

            var scalePercent = 150; // Safer default fallback
            if (clipWidth > 0 && clipHeight > 0) {
                var widthRatio = seqWidth / clipWidth;
                var heightRatio = seqHeight / clipHeight;
                var maxRatio = Math.max(widthRatio, heightRatio);
                scalePercent = maxRatio * 100 * 1.05; // 5% buffer
            }

            // Apply Effects via QE to the LOWER track item
            var qeClip = null;
            var qeTrack = qe.project.getActiveSequence().getVideoTrackAt(trackIndex - 1); // Look at lower track

            if (!qeTrack) {
                alert("Error: QE Track not found at index " + (trackIndex - 1));
            } else {
                for (var q = 0; q < qeTrack.numItems; q++) {
                    var item = qeTrack.getItemAt(q);

                    var itemStartSeconds = 0;
                    if (typeof item.start === 'string') {
                        var timeObj = new Time();
                        timeObj.ticks = item.start;
                        itemStartSeconds = timeObj.seconds;
                    } else if (typeof item.start === 'number') {
                        itemStartSeconds = item.start;
                    } else if (item.start && item.start.seconds !== undefined) {
                        itemStartSeconds = item.start.seconds;
                    } else {
                        if (item.start && item.start.ticks) {
                            var timeObj = new Time();
                            timeObj.ticks = item.start.ticks;
                            itemStartSeconds = timeObj.seconds;
                        }
                    }

                    var diff = Math.abs(itemStartSeconds - clip.start.seconds);
                    if (diff < 0.1) {
                        qeClip = item;
                        break;
                    }
                }
            }

            if (qeClip) {
                var blurEffect = qe.project.getVideoEffectByName("Gaussian Blur");
                if (blurEffect) {
                    qeClip.addVideoEffect(blurEffect);
                } else {
                    blurEffect = qe.project.getVideoEffectByName("Gaussian Blur (Legacy)");
                    if (blurEffect) {
                        qeClip.addVideoEffect(blurEffect);
                    } else {
                        alert("Error: Gaussian Blur effect not found in Premiere Pro.");
                    }
                }
            } else {
                var debugMsg = "Error: Could not find QE Clip on lower track.\n";
                debugMsg += "Target Start: " + clip.start.seconds + "\n";
                alert(debugMsg);
            }

            // Set Parameters via Standard API on the BACKGROUND clip
            var components = backgroundClip.components;
            if (components) {
                for (var c = 0; c < components.numItems; c++) {
                    var comp = components[c];
                    if (comp.displayName.indexOf("Gaussian Blur") !== -1) {
                        var props = comp.properties;
                        for (var p = 0; p < props.numItems; p++) {
                            var prop = props[p];
                            if (prop.displayName === "Blurriness") {
                                prop.setValue(20, true);
                            }
                            if (prop.displayName === "Repeat Edge Pixels") {
                                prop.setValue(true, true);
                            }
                        }
                    }
                    if (comp.displayName === "Motion") {
                        var props = comp.properties;
                        for (var p = 0; p < props.numItems; p++) {
                            var prop = props[p];
                            if (prop.displayName === "Scale") {
                                prop.setValue(scalePercent, true);
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {
        alert("Blurify Error: " + e.toString());
    }
}

function universalUndo() {
    try {
        if (historyStack.length > 0) {
            var project = app.project;
            var sequence = project.activeSequence;
            if (!sequence) return;

            var historyItem = historyStack.pop();
            var trackIndex = historyItem.trackIndex;
            var state = historyItem.state;

            if (trackIndex >= 0 && trackIndex < sequence.videoTracks.numTracks) {
                var videoTrack = sequence.videoTracks[trackIndex];
                restoreTrackState(videoTrack, state);
            } else {
                alert("Undo Error: Original track not found.");
            }
        } else {
            alert("Nothing to undo in extension history.");
        }
    } catch (e) {
        alert("Undo Error: " + e.toString());
    }
}

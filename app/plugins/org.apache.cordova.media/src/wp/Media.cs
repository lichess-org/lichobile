/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Windows;
using System.Diagnostics;

namespace WPCordovaClassLib.Cordova.Commands
{
    /// <summary>
    /// Provides the ability to record and play back audio files on a device. 
    /// </summary>
    public class Media : BaseCommand
    {
        /// <summary>
        /// Audio player objects
        /// </summary>
        private static Dictionary<string, AudioPlayer> players = new Dictionary<string, AudioPlayer>();

        /// <summary>
        /// Represents Media action options.
        /// </summary>
        [DataContract]
        public class MediaOptions
        {
            /// <summary>
            /// Audio id
            /// </summary>
            [DataMember(Name = "id", IsRequired = true)]
            public string Id { get; set; }

            /// <summary>
            /// Path to audio file
            /// </summary>
            [DataMember(Name = "src")]
            public string Src { get; set; }

            /// <summary>
            /// New track position
            /// </summary>
            [DataMember(Name = "milliseconds")]
            public int Milliseconds { get; set; }

            public string CallbackId { get; set; }
        }

        /// <summary>
        /// Releases the audio player instance to save memory.
        /// </summary>  
        public void release(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                MediaOptions mediaOptions = new MediaOptions();

                try
                {
                    string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                    mediaOptions.Id = optionsString[0];
                    callbackId = mediaOptions.CallbackId = optionsString[1];
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
                    return;
                }

                if (!Media.players.ContainsKey(mediaOptions.Id))
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, false), callbackId);
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        AudioPlayer audio = Media.players[mediaOptions.Id];
                        Media.players.Remove(mediaOptions.Id);
                        audio.Dispose();
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK, true), mediaOptions.CallbackId);
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), mediaOptions.CallbackId);
                    }
                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
            }
        }

        private AudioPlayer GetOrCreatePlayerById(string id)
        {
            AudioPlayer audio = null;

            lock (Media.players)
            {
                if (!Media.players.TryGetValue(id, out audio))
                {
                    audio = new AudioPlayer(this, id);
                    Media.players.Add(id, audio);
                    Debug.WriteLine("Media Created in GetOrCreatePlayerById");
                }
            }
            
            

            return audio;
        }

        /// <summary>
        /// Starts recording and save the specified file 
        /// </summary>
        public void startRecordingAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                MediaOptions mediaOptions = new MediaOptions();

                try
                {
                    string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                    mediaOptions.Id = optionsString[0];
                    mediaOptions.Src = optionsString[1];
                    callbackId = mediaOptions.CallbackId = optionsString[2];
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), mediaOptions.CallbackId);
                    return;
                }

                if (mediaOptions != null)
                {

                    Deployment.Current.Dispatcher.BeginInvoke(() =>
                    {
                        try
                        {
                            AudioPlayer audio;
                            if (!Media.players.ContainsKey(mediaOptions.Id))
                            {
                                audio = new AudioPlayer(this, mediaOptions.Id);
                                Media.players.Add(mediaOptions.Id, audio);
                            }
                            else
                            {
                                audio = Media.players[mediaOptions.Id];
                            }

                            if (audio != null)
                            {
                                audio.startRecording(mediaOptions.Src);
                                DispatchCommandResult(new PluginResult(PluginResult.Status.OK), mediaOptions.CallbackId);
                            }
                            else
                            {
                                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR,
                                                        "Error accessing AudioPlayer for key " + mediaOptions.Id), mediaOptions.CallbackId);
                            }
                            
                            
                        }
                        catch (Exception e)
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), mediaOptions.CallbackId);
                        }

                    });
                }
                else
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), mediaOptions.CallbackId);
                }
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
            }
        }

        /// <summary>
        /// Stops recording and save to the file specified when recording started 
        /// </summary>
        public void stopRecordingAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;

            try
            {
                string[] optStrings = JSON.JsonHelper.Deserialize<string[]>(options);
                string mediaId = optStrings[0];
                callbackId = optStrings[1];
                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaId))
                        {
                            AudioPlayer audio = Media.players[mediaId];
                            audio.stopRecording();
                            Media.players.Remove(mediaId);
                        }
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK), callbackId);
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
                    }
                });
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
            }
        }

        public void setVolume(string options) // id,volume
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                string id = optionsString[0];
                double volume = 0.0d;
                double.TryParse(optionsString[1], out volume);

                callbackId = optionsString[2];

                if (Media.players.ContainsKey(id))
                {
                    Deployment.Current.Dispatcher.BeginInvoke(() =>
                    {
                        try
                        {
                            AudioPlayer player = Media.players[id];
                            player.setVolume(volume);
                        }
                        catch (Exception e)
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
                        }
                    });
                }
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION, 
                                                        "Error parsing options into setVolume method"), callbackId);
            }
        }

        // Some Audio Notes:
        // In the Windows Phone Emulator, playback of video or audio content using the MediaElement control is not supported.
        // While playing, a MediaElement stops all other media playback on the phone.
        // Multiple MediaElement controls are NOT supported

        // Called when you create a new Media('blah.wav') object in JS.
        public void create(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                MediaOptions mediaOptions;
                try
                {
                    string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                    mediaOptions = new MediaOptions();
                    mediaOptions.Id = optionsString[0];
                    mediaOptions.Src = optionsString[1];
                    callbackId = mediaOptions.CallbackId = optionsString[2];
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION,
                                            "Error parsing options into create method"), callbackId);
                    return;
                }

                GetOrCreatePlayerById(mediaOptions.Id);
                DispatchCommandResult(new PluginResult(PluginResult.Status.OK), callbackId);

            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
            }
        }

        /// <summary>
        /// Starts or resume playing audio file 
        /// </summary>
        public void startPlayingAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                MediaOptions mediaOptions;
                try
                {
                    string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                    mediaOptions = new MediaOptions();
                    mediaOptions.Id = optionsString[0];
                    mediaOptions.Src = optionsString[1];
                    int msec = 0;
                    if (int.TryParse(optionsString[2], out msec))
                    {
                        mediaOptions.Milliseconds = msec;
                    }
                    callbackId = mediaOptions.CallbackId = optionsString[3];

                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
                    return;
                }

                AudioPlayer audio = GetOrCreatePlayerById(mediaOptions.Id);

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        audio.startPlaying(mediaOptions.Src);
                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK), callbackId);
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
                    }
                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
            }
        }


        /// <summary>
        /// Seeks to a location
        /// </summary>
        public void seekToAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                    mediaOptions = new MediaOptions();
                    mediaOptions.Id = optionsString[0];
                    int msec = 0;
                    if (int.TryParse(optionsString[2], out msec))
                    {
                        mediaOptions.Milliseconds = msec;
                    }
                    callbackId = mediaOptions.CallbackId = optionsString[3];

                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
                    return;
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaOptions.Id))
                        {
                            AudioPlayer audio = Media.players[mediaOptions.Id];
                            audio.seekToPlaying(mediaOptions.Milliseconds);
                        }
                        else
                        {
                            Debug.WriteLine("ERROR: seekToAudio could not find mediaPlayer for " + mediaOptions.Id);
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK), callbackId);
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
                    }
                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
            }
        }

        /// <summary>
        /// Pauses playing 
        /// </summary>
        public void pausePlayingAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);
                string mediaId = optionsString[0];
                callbackId = optionsString[1]; 

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaId))
                        {
                            AudioPlayer audio = Media.players[mediaId];
                            audio.pausePlaying();
                        }
                        else
                        {
                            Debug.WriteLine("ERROR: pausePlayingAudio could not find mediaPlayer for " + mediaId);
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK), callbackId);
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message),callbackId);
                    }
                });


            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION),callbackId);
            }


        }


        /// <summary>
        /// Stops playing the audio file
        /// </summary>
        public void stopPlayingAudio(String options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                string[] optionsStrings = JSON.JsonHelper.Deserialize<string[]>(options);
                string mediaId = optionsStrings[0];
                callbackId = optionsStrings[1];
                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaId))
                        {
                            AudioPlayer audio = Media.players[mediaId];
                            audio.stopPlaying();
                        }
                        else
                        {
                            Debug.WriteLine("stopPlaying could not find mediaPlayer for " + mediaId);
                        }

                        DispatchCommandResult(new PluginResult(PluginResult.Status.OK), callbackId);
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
                    }
                });

            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
            }
        }

        /// <summary>
        /// Gets current position of playback
        /// </summary>
        public void getCurrentPositionAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                string[] optionsStrings = JSON.JsonHelper.Deserialize<string[]>(options);
                string mediaId = optionsStrings[0];
                callbackId = optionsStrings[1];
                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    try
                    {
                        if (Media.players.ContainsKey(mediaId))
                        {
                            AudioPlayer audio = Media.players[mediaId];
                            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, audio.getCurrentPosition()), callbackId);
                        }
                        else
                        {
                            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, -1), callbackId);
                        }
                    }
                    catch (Exception e)
                    {
                        DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
                    }
                });
            }
            catch (Exception)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
                return;
            }
        }


        /// <summary>
        /// Gets the duration of the audio file
        /// </summary>
        
        [Obsolete("This method will be removed shortly")]
        public void getDurationAudio(string options)
        {
            string callbackId = this.CurrentCommandCallbackId;
            try
            {
                MediaOptions mediaOptions;

                try
                {
                    string[] optionsString = JSON.JsonHelper.Deserialize<string[]>(options);

                    mediaOptions = new MediaOptions();
                    mediaOptions.Id = optionsString[0];
                    mediaOptions.Src = optionsString[1];
                    callbackId = mediaOptions.CallbackId = optionsString[2];
                }
                catch (Exception)
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION), callbackId);
                    return;
                }

                AudioPlayer audio;
                if (Media.players.ContainsKey(mediaOptions.Id))
                {
                    audio = Media.players[mediaOptions.Id];
                }
                else
                {
                    Debug.WriteLine("ERROR: getDurationAudio could not find mediaPlayer for " + mediaOptions.Id);
                    audio = new AudioPlayer(this, mediaOptions.Id);
                    Media.players.Add(mediaOptions.Id, audio);
                }

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    DispatchCommandResult(new PluginResult(PluginResult.Status.OK, audio.getDuration(mediaOptions.Src)), callbackId);
                });
            }
            catch (Exception e)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, e.Message), callbackId);
            }
        }
    }
}

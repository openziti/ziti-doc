using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Net.Sockets;
using System.Net.Security;
using System.Net.Http;

using NetFoundry;

namespace Ziti.NET.Examples
{
    class Programb
    {
        static void Main(string[] args)
        {
            ZitiIdentity id = new ZitiIdentity(@"c:\path\to\enrolled.id.json");

            //once parsed - we can try to connect this identity to the Ziti network
            id.InitializeAndRun();

            //set the output encoding of the console to UTF8 to display the ascii art
            Console.OutputEncoding = Encoding.UTF8;

            //if needed - messages will be output to the System.Diagnostics.Debug stream
            //NetFoundry.Ziti.OutputDebugInformation = true;

            ZitiExamples.CallackExample(id, "demo-weather");
            Console.WriteLine("Wait for a response... Press any key when the response returns.");
            Console.ReadKey();

            //ZitiExamples.StreamExample(id, "demo-weather");
            ZitiExamples.SslStreamExample(id, "demo-weather-ssl");
            ZitiExamples.SslStreamExampleAsync(id, "demo-weather-ssl").Wait();
            ZitiExamples.ProxyExampleAsync(id, IPAddress.Parse("0.0.0.0"), 2171, "demo-weather-ssl").Wait();
        }
    }

    class ZitiExamples
    {
        private const int DefaultBufferSize = 64*1024;

        //a predefined and properly formatted GET request to wttr.in
        static string wttrRequestAsString = "GET /Rochester HTTP/1.0\r\n"
                + "Accept: *-/*\r\n"
                + "Connection: close\r\n"
                + "User-Agent: curl/7.59.0\r\n"
                + "Host: wttr.in\r\n"
                + "\r\n";

        static byte[] wttrRequestAsBytes = Encoding.UTF8.GetBytes(wttrRequestAsString);

        public static void StreamExample(ZitiIdentity id, string serviceName)
        {
            ZitiStream zitiStream = new ZitiStream(id.NewConnection(serviceName));

            zitiStream.Write(wttrRequestAsBytes);

            using (var stdout = Console.OpenStandardOutput())
            using (BinaryReader binaryReader = new BinaryReader(zitiStream))
            {
                byte[] bytes = binaryReader.ReadBytes(DefaultBufferSize);
                while (bytes != null && bytes.Length > 0)
                {
                    stdout.Write(bytes);
                    bytes = binaryReader.ReadBytes(DefaultBufferSize);
                }
            }
        }

        public static void SslStreamExample(ZitiIdentity id, string serviceName)
        {
            ZitiStream zitiStream = new ZitiStream(id.NewConnection(serviceName));

            SslStream sslStream = new SslStream(zitiStream);
            sslStream.AuthenticateAsClient("wttr.in");
            sslStream.Write(wttrRequestAsBytes);

            using (var stdout = Console.OpenStandardOutput())
            {
                byte[] available = new byte[DefaultBufferSize];

                int numRead = sslStream.Read(available, 0, DefaultBufferSize);
                while (numRead > 0)
                {
                    stdout.Write(available, 0, numRead);
                    numRead = sslStream.Read(available, 0, DefaultBufferSize);
                }
            }
        }

        public async static Task SslStreamExampleAsync(ZitiIdentity id, string serviceName)
        {
            ZitiStream zitiStream = new ZitiStream(id.NewConnection(serviceName));

            SslStream sslStream = new SslStream(zitiStream);
            await sslStream.AuthenticateAsClientAsync("wttr.in");
            await sslStream.WriteAsync(wttrRequestAsBytes);
            await ZitiStream.PumpAsync(sslStream, Console.OpenStandardOutput());
        }

        public static async Task ProxyExampleAsync(ZitiIdentity id, IPAddress ip, int port, string serviceName)
        {
            var server = new TcpListener(ip, port);
            server.Start();
            while (true)
            {
                Console.WriteLine("Started. Listening on: " + ip + ":" + port);
                var client = await server.AcceptTcpClientAsync().ConfigureAwait(false);
                Console.WriteLine("Client accepted...");
                /*await specifically do not await this invocation so that we can support
                 * more than one connection */
                _ = ProxyAsync(id, client, serviceName);
            }
        }

        public static async Task ProxyAsync(ZitiIdentity id, TcpClient client, string serviceName)
        {
            using (var stream = client.GetStream())
            using (ZitiStream zitiStream = new ZitiStream(id.NewConnection(serviceName)))
            {
                await zitiStream.PumpAsync(stream);
            }
        }

        public static void CallackExample(ZitiIdentity id, string serviceName)
        {            
            ZitiConnection conn = id.NewConnection(serviceName);

            void onConnected(ZitiConnection zitiConnection, ZitiStatus onConnectedStatus)
            {
                if (onConnectedStatus != ZitiStatus.OK)
                {
                    Console.WriteLine("The zitiConnection is not in a good state for use.");
                    Console.WriteLine("You should decide how to handle this. ");
                    Console.WriteLine("    Error: " + onConnectedStatus.GetDescription());
                }
                object dataWrittenContext = "some sort of context";
                void onDataWritten(ZitiStatus dataWrittenStatus, int bytesWritten, object context)
                {
                    Console.WriteLine("here's the context: " + dataWrittenContext.ToString());
                }

                //connection is connected... write the request over the network
                zitiConnection.Write(wttrRequestAsBytes, wttrRequestAsBytes.Length, onDataWritten, dataWrittenContext);
                Console.WriteLine("Data sent");
            }

            void onDataReceived(ZitiStatus dataReceivedStatus, byte[] data, int count)
            {
                if (dataReceivedStatus != ZitiStatus.OK)
                {
                    return; //all done
                }
                else
                {
                    using (var stdout = Console.OpenStandardOutput())
                    {
                        stdout.Write(data, 0, count);
                    }
                }
            }

            //with callbacks established - dial ziti
            conn.Dial(onConnected, onDataReceived);
        }
    }

    internal static class EnumHelper
    {
        /// <summary>
        /// Extension method to enum to return the DescriptionAttribute
        /// </summary>
        /// <param name="enumVal">The enum in question to get the description from</param>
        /// <returns></returns>
        public static string GetDescription(this Enum enumVal)
        {
            var type = enumVal.GetType();
            var memberInfo = type.GetMember(enumVal.ToString());
            var atts = memberInfo[0].GetCustomAttributes(typeof(System.ComponentModel.DescriptionAttribute), false);
            if (atts.Length < 1)
            {
                return "__NO DESCRIPTOIN AVAILABLE__";
            }
            var descAttr = (System.ComponentModel.DescriptionAttribute)(atts[0]);
            return descAttr.Description;
        }
    }
}
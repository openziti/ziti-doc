using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.IO;

namespace Ziti.NET.Examples
{
    class StreamUtil
    {
        private const int DefaultStreamPumpBufferSize = 8192;

        public static async Task PumpAsync(Stream input, Stream destination)
        {
            int count = DefaultStreamPumpBufferSize;
            byte[] buffer = new byte[count];
            int numRead = await input.ReadAsync(buffer, 0, count).ConfigureAwait(false);
            
            while (numRead > 0)
            {
                destination.Write(buffer, 0, numRead);
                //await destination.WriteAsync(buffer, 0, numRead).ConfigureAwait(false);
                numRead = await input.ReadAsync(buffer, 0, count).ConfigureAwait(false);
            }
        }
    }
}

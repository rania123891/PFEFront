using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.Attachments.Commands
{
    public class UploadAttachment
    {
        public record Command : IRequest<Result<AttachmentDto>>
        {
            public IFormFile File { get; set; }
            public int ProjectId { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<AttachmentDto>>
        {
            private readonly DataContext _context;
            private readonly IConfiguration _config;

            public Handler(DataContext context, IConfiguration config)
            {
                _context = context;
                _config = config;
            }

            public async Task<Result<AttachmentDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
                    var uploadPath = _config["FileStorage:UploadPath"];
                    var fileName = request.File.FileName;
                    var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
                    var filePath = Path.Combine(uploadPath, uniqueFileName);

                    Directory.CreateDirectory(uploadPath);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.File.CopyToAsync(stream);
                    }

                    var attachment = new Attachment
                    {
                        Name = fileName,
                        Path = uniqueFileName,
                        ProjectId = request.ProjectId,
                        Size = request.File.Length,
                        UploadDate = DateTime.UtcNow
                    };

                    _context.Attachments.Add(attachment);
                    await _context.SaveChangesAsync();

                    return Result<AttachmentDto>.Success(new AttachmentDto
                    {
                        Id = attachment.Id,
                        Name = attachment.Name,
                        Size = attachment.Size,
                        UploadDate = attachment.UploadDate
                    });
                }
                catch (Exception ex)
                {
                    return Result<AttachmentDto>.Failure("Erreur lors de l'upload du fichier");
                }
            }
        }
    }
} 
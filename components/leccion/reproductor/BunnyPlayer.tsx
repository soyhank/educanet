"use client";

/**
 * Bunny Stream player skeleton.
 * TODO: Complete when BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY
 * are configured.
 */
export function BunnyPlayer({
  bunnyVideoId,
}: {
  bunnyVideoId: string;
  onProgreso: (porcentaje: number) => void;
  onCompletar: () => void;
}) {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

  if (!libraryId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-muted/50">
        <p className="text-sm text-muted-foreground text-center px-4">
          Configura NEXT_PUBLIC_BUNNY_LIBRARY_ID para activar Bunny Stream
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl">
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}?autoplay=false&loop=false`}
        className="h-full w-full"
        allowFullScreen
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        title="Video del curso"
      />
    </div>
  );
}

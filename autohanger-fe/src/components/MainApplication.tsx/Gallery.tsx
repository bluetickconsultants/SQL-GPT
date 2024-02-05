import React, { useState, useEffect, useRef } from 'react';
import Pagination from './Pagination';

interface ImageData {
  id: number;
  src: string;
}

const images: ImageData[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  }, {
    id: 6,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  }, {
    id: 13,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxuYXR1cmV8ZW58MHwwfHx8MTY5NDA5OTcyOXww&ixlib=rb-4.0.3&q=80&w=1080',
  },
  // Add more images with id and src properties
];

const itemsPerPage = 4;

interface Gallery {
  setMainPage: any;
  frames: any;
}


const Gallery: React.FC<Gallery> = ({ setMainPage, frames }) => {
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<any>(1);

  console.log("current", currentPage)

  // useEffect(() => {

  // }, [currentPage]);
  // // setMainPage(currentPage);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (frame: any) => {
    setSelectedImage(frame);
  };

  const handleCloseFullscreen = () => {
    setSelectedImage(null);
  };

  const handlePageChange = (page: number) => {
    setMainPage(page);
    setCurrentPage(page);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedImage &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCloseFullscreen();
      }
    };

    const handlePageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' &&
        target.classList.contains('pagination-button')
      ) {
        const page = parseInt(target.textContent || '1', 10);
        handlePageChange(page);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('click', handlePageClick);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('click', handlePageClick);
    };
  }, [selectedImage, containerRef, handlePageChange]);

  const totalPages = Math.ceil(10);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFrames = frames.slice(startIndex, endIndex);

  return (
    <div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8"
        ref={containerRef}
      >
        {frames.map((frame: any) => (
          <div
            key={frame.id}
            className="group cursor-pointer relative"
            onClick={() => handleImageClick(frame)}
          >
            <img
              src={`data:image/png;base64, ${frame.frame}`}
              alt={`Image ${frame.id}`}
              className="w-full h-48 object-cover rounded-lg transition-transform transform scale-100 group-hover:scale-105"
            />
            <div className='flex justify-between my-[0.8rem]'>
              <h1>Count of People: {frame.count_of_people}</h1>
              <h1>Time Stamp: {frame.timestamp}</h1>
            </div>


            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                View
              </button>
            </div>
          </div>
        ))}

        {selectedImage && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75 flex items-center justify-center">
            <div className="max-w-screen-xl mx-auto fullscreen-image-container">
              <img
                src={`data:image/png;base64, ${selectedImage.frame}`}
                alt={`Image ${selectedImage.id}`}
                className="max-w-full max-h-full"
              />
              <button
                className="absolute top-0 right-0 m-4 text-white hover:text-gray-300 focus:outline-none"
                onClick={handleCloseFullscreen}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Gallery;

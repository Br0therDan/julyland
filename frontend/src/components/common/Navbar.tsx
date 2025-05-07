'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FaPlus } from 'react-icons/fa'
import clsx from 'clsx'

interface NavbarProps {
  type: string
  addModalAs: React.ElementType
  className?: string
}

const Navbar: React.FC<NavbarProps> = ({
  type,
  addModalAs: AddModal,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  return (
    <div className={clsx('flex py-1 gap-2 min-w-[350px]', className)}>
      <Button
        variant='ghost'
        className='flex items-center overflow-auto min-w-20 gap-2'
        onClick={handleOpen}
      >
        <FaPlus /> Add {type}
      </Button>
      {/* Add Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {type}</DialogTitle>
          </DialogHeader>
          <div className='mt-2'>
            {/* AddModal is dynamically injected */}
            <AddModal isOpen={isOpen} onClose={handleClose} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Navbar

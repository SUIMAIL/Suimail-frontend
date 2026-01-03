import { Button } from '../ui/button'
import { MailOpen, RefreshCw, Trash2 } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface EmailListToolbarProps {
  handleSelectAllEmails: (checked: boolean) => void
  hasSelectedEmails: boolean
  refetch?: () => void
  handleMarkSelectedEmailsAsRead: () => void
  handleDeleteSelectedEmails: () => void
  isDraftView?: boolean // ✅ Add this prop
}

export function EmailListToolbar({
  refetch,
  hasSelectedEmails,
  handleSelectAllEmails,
  handleDeleteSelectedEmails,
  handleMarkSelectedEmailsAsRead,
  isDraftView = false, // ✅ Add this with default
}: EmailListToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox onCheckedChange={handleSelectAllEmails} />

      {hasSelectedEmails ? (
        <div className="flex items-center gap-2 pl-2">
          {/* ✅ Only show "Mark as Read" for non-draft views */}
          {!isDraftView && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMarkSelectedEmailsAsRead}
                    className="hover:bg-blue-base/10 hover:text-blue-base"
                  >
                    <MailOpen className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>

              <Separator
                orientation="vertical"
                className="h-5 w-px bg-border"
              />
            </>
          )}

          {/* ✅ Delete button with updated tooltip text for drafts */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteSelectedEmails}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-destructive text-destructive-foreground">
              <p>{isDraftView ? 'Delete drafts' : 'Delete'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <>
          {refetch && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refetch}
                  className="hover:bg-blue-base/10 hover:text-blue-base"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  )
}
